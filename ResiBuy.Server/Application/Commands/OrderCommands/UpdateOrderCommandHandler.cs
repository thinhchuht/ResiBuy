using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record UpdateOrderCommand(UpdateOrderDto Dto) : IRequest<ResponseModel>;
    public class  UpdateOrderCommandHandler(IOrderDbService orderDbService) : IRequestHandler< UpdateOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle( UpdateOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var order = await orderDbService.GetByIdBaseAsync(dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy Order");
            if (order.UserId != dto.UserId && dto.UserId != order.StoreId.ToString() && dto.UserId != order.ShipperId.ToString())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không có quyền sửa đơn hàng này.");
            if (dto.OrderStatus.HasValue)
            {
                if (order.Status == OrderStatus.None)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái  đơn hàng không tồn tại.");
                if (order.Status == OrderStatus.Cancelled)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy trước đó.");
                if (order.Status != OrderStatus.Pending && dto.OrderStatus == OrderStatus.Cancelled)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được hủy đơn hàng khi chưa được xử lý.");
                if (dto.OrderStatus != order.Status + 1 && order.Status != OrderStatus.Pending && dto.OrderStatus != OrderStatus.Cancelled) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có vẻ bạn đã bỏ quả bước nào đó trong quá trình đổi trạng thái đơn hàng.");
                order.Status = dto.OrderStatus.Value;
            }

            if (dto.PaymentStatus.HasValue) 
            {
                if (dto.PaymentStatus == PaymentStatus.None)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái thanh toán không tồn tại.");
                if (dto.PaymentStatus == PaymentStatus.Pending) 
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể đưa đơn hàng về trạng thái chưa thanh toán.");
                if (order.PaymentStatus == PaymentStatus.Pending && dto.PaymentStatus == PaymentStatus.Refunded)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn chưa thanh toán.");
                if (order.PaymentStatus == PaymentStatus.Failed && dto.PaymentStatus != PaymentStatus.Refunded)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy.");
                order.PaymentStatus = dto.PaymentStatus.Value;
            }

            if (dto.ShippingAddressId != Guid.Empty)
            {
                if (order.Status != OrderStatus.Pending)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đổi địa chỉ giao khi đơn hàng chưa được xử lý.");
                order.ShippingAddressId = dto.ShippingAddressId;
            }

            if (!string.IsNullOrEmpty(dto.Note))
            {
                if (order.Status != OrderStatus.Pending)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đổi ghi chú khi đơn hàng chưa được xử lý.");
                order.Note = dto.Note;
            }
            await orderDbService.UpdateAsync(order);
            return ResponseModel.SuccessResponse();
        }
    }
}
