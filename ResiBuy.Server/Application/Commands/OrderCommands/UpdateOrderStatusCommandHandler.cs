using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record UpdateOrderStatusCommand(UpdateOrderStatusDto Dto) : IRequest<ResponseModel>;
    public class UpdateOrderStatusCommandHandler(IOrderDbService orderDbService, INotificationService notificationService) : IRequestHandler<UpdateOrderStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var order = await orderDbService.GetByIdBaseAsync(dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy Order");
            var oldStatus = order.Status;
            if (order.UserId != order.UserId && order.UserId != order.StoreId.ToString() && dto.UserId != order.ShipperId.ToString())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không có quyền sửa đơn hàng này.");
            if (dto.OrderStatus.HasValue)
            {
                if (dto.OrderStatus == OrderStatus.None)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không tồn tại.");
                if (order.Status == OrderStatus.Delivered)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng đã hoàn thành.");
                if (dto.OrderStatus == OrderStatus.Pending)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được đưa đơn hàng về chờ xử lí.");
                if (order.Status == OrderStatus.None)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không tồn tại.");
                if (order.Status == OrderStatus.Cancelled)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy trước đó.");
                if (order.Status == OrderStatus.Pending && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.Processing)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa xử lý chỉ được xử lý hoặc hủy.");
                //if (order.Status != OrderStatus.Pending && dto.OrderStatus == OrderStatus.Cancelled)
                //    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được hủy đơn hàng khi chưa được xử lý.");
                if (dto.OrderStatus != order.Status + 1 && dto.OrderStatus != OrderStatus.Cancelled) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có vẻ bạn đã bỏ quả bước nào đó trong quá trình đổi trạng thái đơn hàng.");
                if (dto.OrderStatus == OrderStatus.Delivered) order.PaymentStatus = PaymentStatus.Paid;
                if (dto.OrderStatus == OrderStatus.Cancelled) order.PaymentStatus = PaymentStatus.Failed;
                order.Status = dto.OrderStatus.Value;
            }
            await orderDbService.UpdateAsync(order);
            var userIds = new List<string>();
            if (dto.OrderStatus == OrderStatus.Processing) userIds.Add(order.UserId);
            if (dto.OrderStatus == OrderStatus.Shipped) userIds.AddRange([order.UserId,order.StoreId.ToString()]);
            if (dto.OrderStatus == OrderStatus.Delivered) userIds.AddRange([order.UserId, order.StoreId.ToString()]);
            if (dto.OrderStatus == OrderStatus.Cancelled) userIds.AddRange([order.UserId, order.StoreId.ToString()]);
            notificationService.SendNotification(Constants.OrderStatusChanged, new OrderStatusChangedDto(order.Id, order.Status, oldStatus, order.PaymentStatus, order.CreateAt), "", userIds);
            return ResponseModel.SuccessResponse();
        }
    }
}
