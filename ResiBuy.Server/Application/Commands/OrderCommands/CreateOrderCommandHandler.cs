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
        IProductDetailDbService productDetailDbService, IStoreDbService storeDbService,
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
            var room = await roomDbService.GetByIdBaseAsync(dto.AddressId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phòng không tồn tại");
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
            cart.IsCheckingOut = false;
            try
            {
                await cartDbService.UpdateAsync(cart);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new CustomException(ExceptionErrorCode.CreateFailed, "Có người khác đang thao tác với giỏ hàng này. Vui lòng thử lại sau vài phút.");
            }
            var productDetailIds = dto.Orders.SelectMany(o => o.Items).Select(pd => pd.ProductDetailId).ToList();
            var rs = await productDetailDbService.CheckIsOutOfStock(productDetailIds);
            IDbContextTransaction? transaction = null;
            try
            {
                transaction = await userDbService.BeginTransactionAsync();
                var orders = dto.Orders.Select(o => new Order(o.Id, o.TotalPrice, o.ShippingFee, dto.PaymentMethod, o.Note, dto.AddressId, dto.UserId, o.StoreId, o.Items.Select(i => new OrderItem(i.Quantity, i.Price, o.Id, i.ProductDetailId)).ToList(), o.VoucherId));
                var createdOrders = await orderDbService.CreateBatchTransactionAsync(orders);
                if (createdOrders == null || !createdOrders.Any()) throw new CustomException(ExceptionErrorCode.CreateFailed, "Không thể tạo đơn hàng");
                if (voucherIds.Any()) await voucherDbService.UpdateQuantityBatchAsync(voucherIds);
                if (!dto.IsInstance)
                    await cartItemDbService.DeleteBatchByProductDetailIdAsync(cart.Id, createdOrders.SelectMany(o => o.Items).Select(ci => ci.ProductDetailId));
                await userDbService.SaveChangesAsync();
                await transaction.CommitAsync();
                foreach (var order in createdOrders)
                {
                    var store = await storeDbService.GetByIdBaseAsync(order.StoreId);
                    var notiUserIds = new List<string> { store.OwnerId, user.Id };
                    await notificationService.SendNotificationAsync(Constants.OrderCreated, new OrderStatusChangedDto(order.Id, order.StoreId, store.Name, order.Status, order.Status, order.PaymentStatus, order.CreateAt), Constants.NoHubGroup, notiUserIds);
                }

                //mailBaseService.SendEmailAsync(user.Email, "Hóa đơn thanh toán đơn hà ResiBuy",);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                if (transaction != null)
                    await transaction.RollbackAsync();
                await notificationService.SendNotificationAsync(Constants.OrderCreatedFailed, new {OrderIds = dto.Orders.Select(o => o.Id)}, Constants.NoHubGroup, [user.Id]);
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
