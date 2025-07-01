//using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
//using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
//using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
//using ResiBuy.Server.Services.RedisServices;

//namespace ResiBuy.Server.Application.Commands.CheckoutComands
//{
//    public record ApplyVoucherCommand(string UserId, ApplyVoucherDto Dto) : IRequest<ResponseModel>;
//    public class ApplyVoucherCommandHandler(ICartItemDbService cartItemDbService,IVoucherDbService voucherDbService, IRedisService redisService) : IRequestHandler<ApplyVoucherCommand, ResponseModel>
//    {
//        public async Task<ResponseModel> Handle(ApplyVoucherCommand request, CancellationToken cancellationToken)
//        {
//            if (string.IsNullOrWhiteSpace(request.UserId) || request.Dto == null)
//                throw new CustomException(ExceptionErrorCode.InvalidInput, "Không có gì để cập nhật");
//            var db = redisService.GetDatabase();
//                var key = $"temp_order:{request.UserId}:{request.Dto.OrderId}";
//                var json = await db.StringGetAsync(key);
//                if (json.IsNullOrEmpty)
//                    throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại sau");
//                    var order = JsonSerializer.Deserialize<TempOrderDto>(json!);
//            if(request.Dto.VoucherId != Guid.Empty)
//            {
//                var voucher = await voucherDbService.GetByIdBaseAsync(request.Dto.VoucherId);
//            }
//            return ResponseModel.SuccessResponse(orders);
//        }
//    }
//}
