﻿using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Application.Commands.OrderCommands
{
    public record UpdateOrderStatusCommand(UpdateOrderStatusDto Dto) : IRequest<ResponseModel>;
    public class UpdateOrderStatusCommandHandler(IOrderDbService orderDbService, IStoreDbService storeDbService, IShipperDbService shipperDbService, INotificationService notificationService) : IRequestHandler<UpdateOrderStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            var order = await orderDbService.GetByIdBaseAsync(dto.OrderId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy đơn hàng");
            var store = await storeDbService.GetByIdBaseAsync(order.StoreId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy cửa hàng");
            var oldStatus = order.Status;
            if (order.UserId != order.UserId && order.UserId != store.OwnerId.ToString() && dto.UserId != order.ShipperId.ToString())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không có quyền sửa đơn hàng này.");
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
                if (order.Status == OrderStatus.None)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trạng thái đơn hàng không tồn tại.");
                if (order.Status == OrderStatus.Cancelled)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng đã bị hủy trước đó.");
                if (order.Status != OrderStatus.Shipped && dto.OrderStatus == OrderStatus.CustomerNotAvailable)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa ở trong trạng thái giao hàng.");
                if (order.Status == OrderStatus.Pending && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.Processing)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa xử lý chỉ được xử lý hoặc hủy.");
                //if (order.Status != OrderStatus.Pending && dto.OrderStatus == OrderStatus.Cancelled)
                //    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được hủy đơn hàng khi chưa được xử lý.");
                if (dto.OrderStatus != order.Status + 1 && dto.OrderStatus != OrderStatus.Cancelled && dto.OrderStatus != OrderStatus.CustomerNotAvailable) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có vẻ bạn đã bỏ quả bước nào đó trong quá trình đổi trạng thái đơn hàng.");
                if (dto.OrderStatus == OrderStatus.Delivered) order.PaymentStatus = PaymentStatus.Paid;
                if (dto.OrderStatus == OrderStatus.Cancelled) order.PaymentStatus = PaymentStatus.Failed;
                order.Status = dto.OrderStatus.Value;
            }
            order.UpdateAt = DateTime.Now;
            if(dto.OrderStatus == OrderStatus.Cancelled)
            {
                if (string.IsNullOrEmpty(dto.Reason))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Lý do hủy đơn hàng không được để trống.");
                order.CancelReason = dto.Reason;
            }
            if (dto.OrderStatus == OrderStatus.Shipped)
            {
                if (!dto.ShipperId.HasValue || dto.ShipperId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id của người giao hợp lệ.");

                var shipper = await shipperDbService.GetByIdBaseAsync(dto.ShipperId.Value)
                    ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy người giao hàng.");

                order.ShipperId = dto.ShipperId.Value; 
            }
            await orderDbService.UpdateAsync(order);
            var userIds = new List<string>();
            if (dto.OrderStatus == OrderStatus.Processing) userIds.Add(order.UserId);
            if (dto.OrderStatus == OrderStatus.Shipped) userIds.AddRange([order.UserId,store.OwnerId.ToString()]);
            if (dto.OrderStatus == OrderStatus.Delivered) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
            if (dto.OrderStatus == OrderStatus.CustomerNotAvailable) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
            if (dto.OrderStatus == OrderStatus.Cancelled) userIds.AddRange([order.UserId, store.OwnerId.ToString()]);
            await notificationService.SendNotificationAsync($"{Constants.OrderStatusChanged}-{order.Status}", new OrderStatusChangedDto(order.Id, order.StoreId, store.Name, order.Status, oldStatus, order.PaymentStatus, order.CreateAt), "", userIds);
            return ResponseModel.SuccessResponse();
        }
    }
}
