using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Queries.CheckoutQueries
{
    public record GetTempOrderByIdsQuery(string UserId, Guid Id) : IRequest<ResponseModel>;

    public class GetTempOrderByIdsQueryHandler(IRedisService redisService) : IRequestHandler<GetTempOrderByIdsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetTempOrderByIdsQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || request.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Thiếu userId hoặc danh sách Id đơn hàng");
            var db = redisService.GetDatabase();
            var key = $"temp_order:{request.UserId}:{request.Id}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);
            return ResponseModel.SuccessResponse(checkoutData);
        }
    }
}
