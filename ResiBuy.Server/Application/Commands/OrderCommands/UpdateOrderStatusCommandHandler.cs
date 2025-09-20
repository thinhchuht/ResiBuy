using Microsoft.EntityFrameworkCore.Storage;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record UpdateOrderStatusCommand(UpdateOrderStatusDto Dto) : IRequest<ResponseModel>;
    public class UpdateOrderStatusCommandHandler(IKafkaProducerService producer, IOrderDbService orderDbService, IStoreDbService storeDbService, IShipperDbService shipperDbService, IProductDetailDbService productDetailDbService, INotificationService notificationService, IUserDbService userDbService, IRoomDbService roomDbService, IMailBaseService mailBaseService) : IRequestHandler<UpdateOrderStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var order = await orderDbService.GetById(dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy đơn hàng");
            var store = await storeDbService.GetByIdBaseAsync(order.StoreId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");
            var oldStatus = order.Status;
            if (order.UserId != order.UserId && order.UserId != store.OwnerId.ToString() && dto.UserId != order.ShipperId.ToString())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không có quyền sửa đơn hàng này.");
            if (dto.OrderStatus != OrderStatus.Pending)
            {
                foreach (var item in order.Items)
                {
                    if (item.Barcodes.Count == 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng thêm barcode cho order");
                    else if (item.Quantity != item.Barcodes.Count)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng barcode không khớp với số lượng sản phẩm trong đơn hàng");
                }
            }
            IDbContextTransaction? transaction = null;
            try
            {
                transaction = await orderDbService.BeginTransactionAsync();
                order.UpdateAt = DateTime.Now;
                //var notiProductDetails = new List<ProductDetail>();
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
                    if (dto.OrderStatus != order.Status + 1 && dto.OrderStatus != OrderStatus.Delivered && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.CustomerNotAvailable) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có vẻ bạn đã bỏ quả bước nào đó trong quá trình đổi trạng thái đơn hàng.");
                    if (dto.OrderStatus == OrderStatus.Processing)
                    {
                        var message = JsonSerializer.Serialize(dto);
                        producer.ProduceMessageAsync("process", message, "process-topic");
                        // Only send message when moving to Processing. Skip subsequent steps.
                        await transaction.CommitAsync();
                        return ResponseModel.SuccessResponse();
                    }
                    if (dto.OrderStatus == OrderStatus.Delivered)
                    {
                        var items = order.Items;
                        var productDetailIds = items.Select(i => i.ProductDetailId).ToList();
                        var productDetails = await productDetailDbService.GetBatchAsync(productDetailIds);
                        order.PaymentStatus = PaymentStatus.Paid;
                        foreach (var item in items)
                        {
                            var productDetail = productDetails.First(pd => pd.Id == item.ProductDetailId);
                            productDetail.Sold += item.Quantity;
                        }
                        await productDetailDbService.UpdateTransactionBatch(productDetails);

                    }
                    if (dto.OrderStatus == OrderStatus.Cancelled) order.PaymentStatus = PaymentStatus.Failed;
                    order.Status = dto.OrderStatus.Value;
                }
                if (dto.OrderStatus == OrderStatus.Cancelled)
                {
                    if (string.IsNullOrEmpty(dto.Reason))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Lý do hủy đơn hàng không được để trống.");
                    var items = order.Items;
                    var productDetailIds = items.Select(i => i.ProductDetailId).ToList();
                    var productDetails = await productDetailDbService.GetBatchAsync(productDetailIds);
                    order.CancelReason = dto.Reason;
                    foreach (var item in items)
                    {
                        var productDetail = productDetails.First(pd => pd.Id == item.ProductDetailId);
                        productDetail.Quantity += item.Quantity;
                    }
                    await productDetailDbService.UpdateTransactionBatch(productDetails);

                }
                if (dto.OrderStatus == OrderStatus.Assigned)
                {
                    if (!dto.ShipperId.HasValue || dto.ShipperId == Guid.Empty)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id của người giao hợp lệ.");

                    var shipper = await shipperDbService.GetByIdBaseAsync(dto.ShipperId.Value)
                        ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người giao hàng.");

                    order.ShipperId = dto.ShipperId.Value;
                }
                if (dto.OrderStatus == OrderStatus.Shipped)
                {
                    if (!dto.ShipperId.HasValue || dto.ShipperId == Guid.Empty)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id của người giao hợp lệ.");

                    var shipper = await shipperDbService.GetByIdBaseAsync(dto.ShipperId.Value)
                        ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người giao hàng.");

                    order.ShipperId = dto.ShipperId.Value;
                }
                //await orderDbService.UpdateAsync(order);
                await orderDbService.UpdateTransactionAsync(order);
                await orderDbService.SaveChangesAsync();
                await transaction.CommitAsync();
                var userIds = new List<string>();
                //if (dto.OrderStatus == OrderStatus.Processing) userIds.Add(order.UserId);
                if (dto.OrderStatus == OrderStatus.Assigned)
                    userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
                if (dto.OrderStatus == OrderStatus.Shipped) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
                if (dto.OrderStatus == OrderStatus.Delivered) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
                if (dto.OrderStatus == OrderStatus.CustomerNotAvailable) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
                if (dto.OrderStatus == OrderStatus.Cancelled) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
                if (dto.OrderStatus != OrderStatus.Processing)
                    await notificationService.SendNotificationAsync($"{Constants.OrderStatusChanged}-{order.Status}", new OrderStatusChangedDto(order.Id, order.StoreId, store.Name, order.Status, oldStatus, order.PaymentStatus, order.CreateAt, order.UpdateAt), "", userIds);
                //foreach (var productDetail in notiProductDetails)
                //{
                //    await notificationService.SendNotificationAsync(Constants.ProductOutOfStock, new ProductOutOfStockDto(productDetail.Id, productDetail.Product.Name, productDetail.Product.Store.Name, productDetail.Product.StoreId), Constants.NoHubGroup, [productDetail.Product.Store.OwnerId.ToString()]);
                //}
                if (dto.OrderStatus == OrderStatus.Delivered)
                {
                    var user = await userDbService.GetUserById(order.UserId);
                    var shippingAddress = await roomDbService.GetByIdAsync(order.ShippingAddressId);
                    await shipperDbService.UpdateTimeDelevery(order.ShipperId.Value);
                    if (user != null && shippingAddress != null)
                    {
                        var htmlBody = GenerateCreateOrderHtmlBody(new[] { order }, user, shippingAddress);
                        mailBaseService.SendEmailInAnotherThread(user.Email, "Hóa đơn ResiBuy - Đơn hàng đã giao thành công", htmlBody);
                    }
                }
            }
            catch (Exception ex)
            {
                if (transaction != null)
                    await transaction.RollbackAsync();

                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
            return ResponseModel.SuccessResponse();
        }

        private string GenerateCreateOrderHtmlBody(IEnumerable<Order> orders, User user, Room shippingAddress)
        {
            var totalAmount = orders.Sum(o => o.TotalPrice);
            var totalShippingFee = orders.Sum(o => o.ShippingFee ?? 0);
            var grandTotal = totalAmount + totalShippingFee;
            var orderDate = orders.First().CreateAt.ToString("dd/MM/yyyy HH:mm");

            return $@"
<div style='font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 20px;'>
    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;'>
        <div>
            <h3 style='color: #495057; margin-bottom: 15px; font-size: 1.2rem; border-bottom: 2px solid #667eea; padding-bottom: 5px; display: inline-block;'>📋 Thông tin đơn hàng</h3>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Ngày đặt hàng:</strong> {orderDate}</p>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Số lượng đơn hàng:</strong> {orders.Count()}</p>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Tổng sản phẩm:</strong> {orders.SelectMany(o => o.Items).Sum(i => i.Quantity)}</p>
        </div>
        
        <div>
            <h3 style='color: #495057; margin-bottom: 15px; font-size: 1.2rem; border-bottom: 2px solid #667eea; padding-bottom: 5px; display: inline-block;'>👤 Thông tin khách hàng</h3>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Họ tên:</strong> {user.FullName ?? "Không có thông tin"}</p>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Email:</strong> {user.Email}</p>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Số điện thoại:</strong> {user.PhoneNumber ?? "Không có thông tin"}</p>
            <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong style='color: #212529;'>Địa chỉ giao hàng:</strong> {shippingAddress.Name}, {shippingAddress.Building.Name}, {shippingAddress.Building.Area.Name}</p>
        </div>
    </div>
    
    <div style='padding: 20px;'>
        <h2 style='color: #495057; margin-bottom: 20px; font-size: 1.5rem; text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 10px;'>📦 Chi tiết đơn hàng</h2>
        
        {string.Join("", orders.Select(order => $@"
        <div style='border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 25px; overflow: hidden;'>
            <div style='background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%); padding: 15px 20px; border-bottom: 1px solid #dee2e6;'>
                <h4 style='color: #495057; font-size: 1.1rem; margin-bottom: 5px;'>🏪 {order.Store.Name}</h4>
                <p style='margin: 0; font-size: 0.9rem;'><strong>Mã đơn:</strong> {order.Id.ToString().ToUpper()}</p>
            </div>
            
            <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                <thead>
                    <tr>
                        <th style='background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 0.9rem;'>Sản phẩm</th>
                        <th style='background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 0.9rem;'>Số lượng</th>
                        <th style='background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 0.9rem;'>Đơn giá</th>
                        <th style='background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 0.9rem;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {string.Join("", order.Items.Select((item, index) => $@"
                    <tr style='{(index % 2 == 0 ? "background-color: #f8f9fa;" : "")}'>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; font-size: 0.9rem;'>{item.ProductDetail.Product.Name}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; font-size: 0.9rem;'>{item.Quantity}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; font-size: 0.9rem; font-weight: 600; color: #28a745;'>{item.Price:N0} VNĐ</td>
                        <td style='padding: 12px; border-bottom: 1px solid #e9ecef; font-size: 0.9rem; font-weight: 600; color: #28a745;'>{(item.Price * item.Quantity):N0} VNĐ</td>
                    </tr>"))}
                </tbody>
            </table>
            
            <div style='background-color: #f8f9fa; padding: 15px 20px; text-align: right; border-top: 2px solid #667eea;'>
                <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong>Tạm tính:</strong> <span style='font-weight: 600; color: #28a745;'>{order.Items.Sum(i => i.Price * i.Quantity):N0} VNĐ</span></p>
                <p style='margin-bottom: 8px; font-size: 0.95rem;'><strong>Phí giao hàng:</strong> <span style='font-weight: 600; color: #28a745;'>{(order.ShippingFee ?? 0):N0} VNĐ</span></p>
                {(order.Voucher != null ? $"<p style='margin-bottom: 8px; font-size: 0.95rem;'><strong>Giảm giá:</strong> <span style='color: #28a745;'>-{order.Voucher.DiscountAmount:N0} VNĐ</span></p>" : "")}
                <p style='font-size: 1.2rem; font-weight: 700; color: #dc3545; border-top: 1px solid #dee2e6; padding-top: 10px; margin-top: 10px;'>Tổng cộng: {order.TotalPrice:N0} VNĐ</p>
            </div>
            
            {(!string.IsNullOrEmpty(order.Note) ? $"<div style='padding: 15px 20px; background-color: #fff3cd; border-top: 1px solid #ffeaa7;'><strong>📝 Ghi chú:</strong> {order.Note}</div>" : "")}
        </div>"))}
    </div>
    
    <div style='background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 25px; text-align: center; margin-top: 20px; border-radius: 8px;'>
        <h3 style='font-size: 1.8rem; margin-bottom: 10px;'>💰 Tổng thanh toán: {grandTotal:N0} VNĐ</h3>
        <p style='font-size: 1.1rem; opacity: 0.9;'>Bao gồm {orders.Count()} đơn hàng từ {orders.Select(o => o.Store.Name).Distinct().Count()} cửa hàng</p>
    </div>
</div>";
        }
    }
}
