using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public record UpdateTempOrderCommand(string UserId, TempCheckoutDto Dto) : IRequest<ResponseModel>;
    public class UpdateTempOrderCommandHandler(ICartItemDbService cartItemDbService, IRoomDbService roomDbService, IStoreDbService storeDbService,
        IVoucherDbService voucherDbService, IOrderDbService orderDbService, IRedisService redisService) : IRequestHandler<UpdateTempOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateTempOrderCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || request.Dto.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Thiếu userId hoặc danh sách Id đơn hàng");
            var db = redisService.GetDatabase();
            var key = $"temp_order:{request.UserId}-{request.Dto.Id}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);
            if (checkoutData == null)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Không thể đọc dữ liệu đơn hàng tạm thời");
            // Cập nhật addressId và paymentMethod nếu có
            if (request.Dto.AddressId.HasValue)
            {
                var room = await roomDbService.GetByIdAsync(request.Dto.AddressId.Value);
                if(!room.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Phòng {room.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
                if (!room.Building.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Tòa nhà {room.Building.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
                if (!room.Building.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Tòa nhà {room.Building.Area.Name} hiện đang không hoạt động, hãy chọn địa chỉ khác");
                checkoutData.AddressId = request.Dto.AddressId;
            }
            checkoutData.PaymentMethod = request.Dto.PaymentMethod;
            // Cập nhật voucher và note cho từng order
            foreach (var updateOrder in request.Dto.Orders)
            {
                var order = checkoutData.Orders.FirstOrDefault(o => o.Id == updateOrder.Id);
                if (order != null)
                {
                    var store = await storeDbService.GetStoreByIdAsync(order.StoreId);
                    if (request.Dto.AddressId.HasValue)
                    {
                        var weight = order.ProductDetails.Select(pd => pd.Weight).Sum();
                        updateOrder.ShippingFee = await orderDbService.ShippingFeeCharged(request.Dto.AddressId.Value, store.RoomId, weight);
                    }
                    order.Note = updateOrder.Note;
                    if (updateOrder.VoucherId.HasValue && updateOrder.VoucherId != Guid.Empty)
                    {
                        if (order.VoucherId == updateOrder.VoucherId) continue;
                        var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers([updateOrder.VoucherId]);
                        if (!checkVoucherRs.IsSuccess()) throw new CustomException(ExceptionErrorCode.ValidationFailed, checkVoucherRs.Message);
                        var voucher = await voucherDbService.GetByIdBaseAsync(updateOrder.VoucherId.Value);
                        if (voucher == null || voucher.StoreId != order.StoreId)
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher không hợp lệ hoặc không thuộc cửa hàng này");
                        if(voucher.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher đã hết hàng");
                        await voucherDbService.CheckIsActiveVouchers([voucher.Id]);
                        if (voucher.MinOrderPrice > order.TotalBeforeDiscount)
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Đơn hàng của bạn chưa đủ điều kiện sử dụng voucher này, cần tối thiểu {voucher.MinOrderPrice}đ");
                        order.VoucherId = voucher.Id;
                        order.TotalPrice = CalculatePrice.GetFinalTotal(order.TotalBeforeDiscount, voucher) + order.ShippingFee;
                        order.DiscountAmount = CalculatePrice.GetDiscountAmount(order.TotalBeforeDiscount, voucher);
                        order.Voucher = new VoucherDto(
                            voucher.Id,
                            voucher.DiscountAmount,
                            voucher.Type,
                            voucher.Quantity,
                            voucher.MinOrderPrice,
                            voucher.MaxDiscountPrice,
                            voucher.StartDate,
                            voucher.EndDate,
                            voucher.IsActive
                        );
                    }
                    else
                    {
                        order.VoucherId = null;
                        order.Voucher = null;
                        order.DiscountAmount = 0;
                        order.TotalPrice = order.TotalBeforeDiscount + order.ShippingFee;
                    }
                }
            }
            checkoutData.GrandTotal = checkoutData.Orders.Sum(o => o.TotalPrice);
            var ttl = await db.KeyTimeToLiveAsync(key);
            var updatedJson = JsonSerializer.Serialize(checkoutData);
            await db.StringSetAsync(key, updatedJson, ttl);
            return ResponseModel.SuccessResponse(checkoutData);
        }
    }
}