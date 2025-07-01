using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Queries.CheckoutQueries
{
    public record GetTempOrderByIdsQuery(string UserId, Guid Id) : IRequest<ResponseModel>;

    public class GetTempOrderByIdsQueryHandler(IRedisService redisService, IVoucherDbService voucherDbService) : IRequestHandler<GetTempOrderByIdsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetTempOrderByIdsQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || request.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Thiếu userId hoặc danh sách Id đơn hàng");
            var db = redisService.GetDatabase();
            var key = $"temp_order:{request.UserId}-{request.Id}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);

            // Duyệt qua từng order, lấy voucher nếu cần
            foreach (var order in checkoutData.Orders)
            {
                if (order.VoucherId.HasValue && order.Voucher == null)
                {
                    var voucher = await voucherDbService.GetByIdBaseAsync(order.VoucherId.Value);
                    if (voucher != null)
                    {
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
                }
            }

            return ResponseModel.SuccessResponse(checkoutData);
        }
    }
}
