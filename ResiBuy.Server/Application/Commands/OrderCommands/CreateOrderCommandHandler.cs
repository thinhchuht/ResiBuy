using Microsoft.EntityFrameworkCore.Storage;
using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record CreateOrderCommand(CheckoutDto CheckoutDto) : IRequest<ResponseModel>;
    public class CreateOrderCommandHandler(IUserDbService userDbService, IOrderDbService orderDbService, IRoomDbService roomDbService,
        IVoucherDbService voucherDbService, ICartDbService cartDbService, ICartItemDbService cartItemDbService,
        IProductDetailDbService productDetailDbService, IStoreDbService storeDbService, IProductDbService productDbService,
        IMailBaseService mailBaseService, INotificationService notificationService
        ) : IRequestHandler<CreateOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.CheckoutDto;
            if (dto.UserId == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống");
            if (dto.GrandTotal < 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tổng tiền không được nhỏ hơn 0");
            if (dto.Orders == null || !dto.Orders.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có đơn hàng nào để tạo");
            if (dto.Orders.Any(o => o.TotalPrice < 0))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tổng tiền của đơn hàng không được nhỏ hơn 0");
            if (dto.Orders.Any(o => !o.Items.Any()) || dto.Orders.Any(o => o.Items.Any(i => i.Quantity <= 0 || i.Price < -10000)))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng phải có sản phẩm và số lượng phải lớn hơn 0");
            var room = await roomDbService.GetByIdAsync(dto.AddressId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phòng không tồn tại");
            if (!room.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Phòng {room.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
            if (!room.Building.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Tòa nhà {room.Building.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
            if (!room.Building.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Tòa nhà {room.Building.Area.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
            var user = await userDbService.GetUserById(dto.UserId);
            if (user == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if (!user.Roles.Contains(Constants.CustomerRole)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ có người mua mới tạo được đơn hàng.");
            if (user.Cart == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có tồn tại giỏ hàng.");
            var cart = await cartDbService.GetByIdAsync(user.Cart.Id);
            if (!cart.CartItems.Any() && !dto.IsInstance) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng không có sản phẩm nào.");
            if (!cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng chưa ở trạng thái thanh toán.");
            var voucherIds = dto.Orders.Select(o => o.VoucherId);
            var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers(voucherIds);
            if (!checkVoucherRs.IsSuccess()) throw new CustomException(ExceptionErrorCode.ValidationFailed, checkVoucherRs.Message);

            var productDetailIds = dto.Orders.SelectMany(o => o.Items).Select(pd => pd.ProductDetailId).ToList();
            var rs = await productDetailDbService.CheckIsOutOfStock(productDetailIds);
            IDbContextTransaction? transaction = null;
            try
            {

                transaction = await userDbService.BeginTransactionAsync();
                cart.IsCheckingOut = false;
                await cartDbService.UpdateTransactionAsync(cart);
                var notiProductDetails = new List<ProductDetail>();
                var orders = dto.Orders.Select(o => new Order(o.Id, o.TotalPrice, o.ShippingFee, dto.PaymentMethod, o.Note, dto.AddressId, dto.UserId, o.StoreId, o.Items.Select(i => new OrderItem(i.Quantity, i.Price, o.Id, i.ProductDetailId)).ToList(), o.VoucherId));
                if (voucherIds.Any()) await voucherDbService.UpdateQuantityBatchAsync(voucherIds);


                var createdOrders = await orderDbService.CreateBatchTransactionAsync(orders);
                var productDetails = await productDetailDbService.GetBatchAsync(productDetailIds);
                foreach (var productDetail in productDetails)
                {
                    if(!productDetail.Product.Category.Status) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Danh mục sản phẩm {productDetail.Product.Name} đã tạm thời ngừng hoạt động");
                    if(!dto.IsInstance && !cart.CartItems.Any(ci => ci.ProductDetailId == productDetail.Id)) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Không tồn tài sản phẩm trong giỏ hàng");
                    if (productDetail.Product.IsOutOfStock || productDetail.IsOutOfStock || productDetail.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Sản phẩm {productDetail.Product.Name} đã hết hàng");
                    var totalOrderedQuantity = orders
                        .SelectMany(o => o.Items)
                        .Where(oi => oi.ProductDetailId == productDetail.Id)
                        .Sum(oi => oi.Quantity);
                    if (productDetail.Quantity < totalOrderedQuantity)
                        throw new CustomException(ExceptionErrorCode.CreateFailed,
                            $"Số lượng tồn kho không đủ cho sản phẩm  {productDetail.Product.Name}");

                    productDetail.Quantity -= totalOrderedQuantity;
                    if (productDetail.Quantity == 0)
                    { 
                        productDetail.IsOutOfStock = true;
                        productDetail.Sold = productDetail.Sold + totalOrderedQuantity;
                        notiProductDetails.Add(productDetail);
                        var allDetails = await productDetailDbService.GetByProductIdAsync(productDetail.ProductId);
                        if (allDetails.All(pd => pd.IsOutOfStock || pd.Quantity == 0))
                        {
                            productDetail.Product.IsOutOfStock = true;
                        }
                    }
                }
                if (createdOrders == null || !createdOrders.Any()) throw new CustomException(ExceptionErrorCode.CreateFailed, "Không tồn tại đơn hàng");
                if (!dto.IsInstance)
                    await cartItemDbService.DeleteBatchByProductDetailIdAsync(cart.Id, createdOrders.SelectMany(o => o.Items).Select(ci => ci.ProductDetailId));
                await userDbService.SaveChangesAsync();
                await transaction.CommitAsync();
                foreach (var order in createdOrders)
                {
                    var store = await storeDbService.GetByIdBaseAsync(order.StoreId);
                    var notiUserIds = new List<string> { store.OwnerId, user.Id };
                    await notificationService.SendNotificationAsync(Constants.OrderCreated, new OrderStatusChangedDto(order.Id, order.StoreId, store.Name, order.Status, order.Status, order.PaymentStatus, order.CreateAt, order.UpdateAt), Constants.NoHubGroup, notiUserIds);
                }
                foreach (var productDetail in notiProductDetails)
                {
                    await notificationService.SendNotificationAsync(Constants.ProductOutOfStock, new ProductOutOfStockDto(productDetail.Id, productDetail.Product.Name, productDetail.Product.Store.Name, productDetail.Product.StoreId), Constants.NoHubGroup, [productDetail.Product.Store.OwnerId.ToString()]);
                }

                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                //if (transaction != null)
                //    await transaction.RollbackAsync();
                await notificationService.SendNotificationAsync(Constants.OrderCreatedFailed, new OrderCreateFailedDto(dto.Orders.Select(o => o.Id), ex.Message), Constants.NoHubGroup, [user.Id]);
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
