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

            //if (dto.PaymentStatus.HasValue) 
            //{
            //    if (dto.PaymentStatus == PaymentStatus.None)
            //        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái thanh toán không tồn tại.");
            //    if (dto.PaymentStatus == PaymentStatus.Pending) 
            //        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể đưa đơn hàng về trạng thái chưa thanh toán.");
            //    if (order.PaymentStatus == PaymentStatus.Pending && dto.PaymentStatus == PaymentStatus.Refunded)
            //        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn chưa thanh toán.");
            //    if (order.PaymentStatus == PaymentStatus.Failed && dto.PaymentStatus != PaymentStatus.Refunded)
            //        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy.");
            //    order.PaymentStatus = dto.PaymentStatus.Value;
            //}

            if (dto.ShippingAddressId != Guid.Empty)
            {
                if (order.Status != OrderStatus.Pending)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đổi địa chỉ giao khi đơn hàng chưa được xử lý.");
                order.ShippingAddressId = dto.ShippingAddressId;
                var oldShippingFee = order.ShippingFee;
                //order.ShippingFee = await orderDbService.ShippingFeeCharged(dto.ShippingAddressId, order.StoreId, order.ProductDetails.Select(pd => pd.Weight).Sum());
                order.ShippingFee = 7000;
                order.TotalPrice = order.TotalPrice - oldShippingFee.Value + 7000;
            }

            if (!string.IsNullOrEmpty(dto.Note))
            {
                if (order.Status != OrderStatus.Pending)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đổi ghi chú khi đơn hàng chưa được xử lý.");
                if(dto.Note.Length > 100)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ghi chú không được quá 100 ký tự.");
                order.Note = dto.Note;
            }
            order.UpdateAt = DateTime.Now;
            await orderDbService.UpdateAsync(order);
            return ResponseModel.SuccessResponse();
        }
    }
}
