using Microsoft.EntityFrameworkCore.Storage;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record ProcessOrderCommand(UpdateOrderStatusDto Dto) : IRequest<ResponseModel>;
    public class ProcessOrderCommandHandler(IOrderDbService orderDbService, IStoreDbService storeDbService, IShipperDbService shipperDbService, IProductDetailDbService productDetailDbService, INotificationService notificationService, IUserDbService userDbService, IRoomDbService roomDbService, IMailBaseService mailBaseService) : IRequestHandler<ProcessOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ProcessOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var order = await orderDbService.GetById(dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy đơn hàng");
            var store = await storeDbService.GetByIdBaseAsync(order.StoreId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");
            var oldStatus = order.Status;
            if (order.UserId != order.UserId && order.UserId != store.OwnerId.ToString() && dto.UserId != order.ShipperId.ToString())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không có quyền sửa đơn hàng này.");

            IDbContextTransaction? transaction = null;
            try
            {
                transaction = await orderDbService.BeginTransactionAsync();
                order.UpdateAt = DateTime.Now;
                var notiProductDetails = new List<ProductDetail>();
                if (dto.OrderStatus.HasValue)
                {
                    if (dto.OrderStatus == OrderStatus.None)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không tồn tại.");
                    if (dto.OrderStatus == OrderStatus.Reported)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không hợp lệ.");
                    if (order.Status == OrderStatus.Delivered)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng đã hoàn thành.");
                    if (dto.OrderStatus == OrderStatus.Pending)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được đưa đơn hàng về chờ xử lí.");
                    if (dto.OrderStatus == OrderStatus.Assigned)
                    {
                        if (order.Status != OrderStatus.Processing)
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được xác nhận giao khi đơn hàng đang ở trạng thái đang chờ giao.");
                    }
                    if (oldStatus == OrderStatus.None)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không tồn tại.");
                    if (oldStatus == OrderStatus.Cancelled)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy trước đó.");
                    if (oldStatus != OrderStatus.Shipped && dto.OrderStatus == OrderStatus.CustomerNotAvailable)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa được vận chuyển");
                    if (oldStatus != OrderStatus.Shipped && oldStatus != OrderStatus.CustomerNotAvailable && dto.OrderStatus == OrderStatus.Delivered)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa ở trong trạng thái giao hàng.");
                    if (oldStatus == OrderStatus.Pending && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.Processing)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa xử lý chỉ được xử lý hoặc hủy.");
                    //if (dto.OrderStatus != order.Status + 1 && dto.OrderStatus != OrderStatus.Delivered && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.CustomerNotAvailable) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có vẻ bạn đã bỏ quả bước nào đó trong quá trình đổi trạng thái đơn hàng.");

                    if (dto.OrderStatus == OrderStatus.Processing)
                    {
                        var items = order.Items;
                        var productDetailIds = items.Select(i => i.ProductDetailId).ToList();
                        var productDetails = await productDetailDbService.GetBatchAsync(productDetailIds);
                        foreach (var item in items)
                        {
                            var productDetail = productDetails.First(pd => pd.Id == item.ProductDetailId);
                            if (productDetail.Product.IsOutOfStock || productDetail.IsOutOfStock || productDetail.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Sản phẩm {productDetail.Product.Name} đã hết hàng");
                            if (productDetail.Quantity < item.Quantity)
                                throw new CustomException(ExceptionErrorCode.CreateFailed,
                                    $"Mặt hàng {productDetail.Product.Name} chỉ còn {productDetail.Quantity} sản phẩm");
                            productDetail.Quantity -= item.Quantity;
                            if (productDetail.Quantity == 0)
                            {
                                productDetail.IsOutOfStock = true;
                                notiProductDetails.Add(productDetail);
                                var allDetails = await productDetailDbService.GetByProductIdAsync(productDetail.ProductId);
                                if (allDetails.All(pd => pd.IsOutOfStock || pd.Quantity == 0))
                                {
                                    productDetail.Product.IsOutOfStock = true;
                                }
                            }
                        }
                        await productDetailDbService.UpdateTransactionBatch(productDetails);
                    }
                    order.Status = dto.OrderStatus.Value;
                }
                await orderDbService.UpdateTransactionAsync(order);
                await orderDbService.SaveChangesAsync();
                await transaction.CommitAsync();
                var userIds = new List<string>();
                //await notificationService.SendNotificationAsync(Constants.OrderProcessed, order.Id , Constants.NoHubGroup, [order.Store.OwnerId.ToString()], false);
                if (dto.OrderStatus == OrderStatus.Processing) userIds.Add(order.UserId);
                await notificationService.SendNotificationAsync($"{Constants.OrderStatusChanged}-{order.Status}", new OrderStatusChangedDto(order.Id, order.StoreId, store.Name, order.Status, oldStatus, order.PaymentStatus, order.CreateAt, order.UpdateAt), "", [order.UserId, order.Store.OwnerId]);
                foreach (var productDetail in notiProductDetails)
                {
                    await notificationService.SendNotificationAsync(Constants.ProductOutOfStock, new ProductOutOfStockDto(productDetail.Id, productDetail.Product.Name, productDetail.Product.Store.Name, productDetail.Product.StoreId), Constants.NoHubGroup, [productDetail.Product.Store.OwnerId.ToString()]);
                }
            }
            catch (Exception ex)
            {
                //if (transaction != null)
                //    await transaction.RollbackAsync();
                await notificationService.SendNotificationAsync(Constants.OrderProcessFailed, new OrderProcessFailedDto(order.Id, ex.Message), Constants.NoHubGroup, [order.Store.OwnerId.ToString()], false);
                //throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
            return ResponseModel.SuccessResponse();
        }
    }
}