using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public record UpdateTempOrderCommand(string UserId,TempCheckoutDto Dto) : IRequest<ResponseModel>;
    public class  UpdateTempOrderCommandHandler(ICartItemDbService cartItemDbService, IVoucherDbService voucherDbService, IRedisService redisService) : IRequestHandler< UpdateTempOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateTempOrderCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || request.Dto.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Thiếu userId hoặc danh sách Id đơn hàng");
            var db = redisService.GetDatabase();
            var key = $"temp_order:{request.UserId}:{request.Dto.Id}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            //var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);
            foreach(var order in request.Dto.Orders)
            {
                if (order.VoucherId.HasValue && order.VoucherId != Guid.Empty)
                {
                    var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers([order.VoucherId]);
                    if (!checkVoucherRs.IsSuccess()) throw new CustomException(ExceptionErrorCode.ValidationFailed, checkVoucherRs.Message);
                    var voucher = await voucherDbService.GetByIdBaseAsync(order.VoucherId.Value);
                    if (voucher == null || voucher.StoreId != order.StoreId)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Voucher không hợp lệ hoặc không thuộc cửa hàng này");
                    order.VoucherId = voucher.Id;
                    order.TotalPrice = CalculatePrice.GetTotalPrice(order.TotalPrice, voucher);
                }
            }
            request.Dto.GrandTotal = request.Dto.Orders.Sum(o => o.TotalPrice);
            var ttl = await db.KeyTimeToLiveAsync(key);
            var updatedJson = JsonSerializer.Serialize(request.Dto);
            await db.StringSetAsync(key, updatedJson, ttl);
            return ResponseModel.SuccessResponse(request.Dto);
        }
    }
}
