using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public record CheckoutCommand(string UserId, Guid CheckoutId) : IRequest<ResponseModel>;
    public class CheckoutCommandHandler(IKafkaProducerService producer, IUserDbService userDbService, ICartDbService cartDbService, IVoucherDbService voucherDbService, IRedisService redisService) : IRequestHandler<CheckoutCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CheckoutCommand request, CancellationToken cancellationToken)
        {
            var user = await userDbService.GetUserById(request.UserId);
            if (user == null) throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy người dùng");
            var cart = await cartDbService.GetByIdAsync(user.Cart.Id);
            if (cart == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy giỏ hàng");
            if (cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng đang được thanh toán ở nơi khác.");
            if (string.IsNullOrWhiteSpace(request.UserId) || request.CheckoutId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Thiếu userId hoặc danh sách Id đơn hàng");
            var db = redisService.GetDatabase();
            var key = $"temp_order:{request.UserId}:{request.CheckoutId}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);
            var voucherIds = checkoutData.Orders.Select(o => o.VoucherId).ToList();
            var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers(voucherIds);
            if (!checkVoucherRs.IsSuccess()) throw new CustomException(ExceptionErrorCode.ValidationFailed, checkVoucherRs.Message);
            cart.IsCheckingOut = true;
            try
            {
               await cartDbService.UpdateAsync(cart);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Có người khác đang thao tác với giỏ hàng này. Vui lòng thử lại.");
            }
            var checkoutDto = new CheckoutDto
            {
                UserId = request.UserId,
                GrandTotal = checkoutData.GrandTotal,
                AddressId = checkoutData.AddressId ?? Guid.Empty,
                PaymentMethod = checkoutData.PaymentMethod,
                IsInstance = checkoutData.IsInstance,
                Orders = checkoutData.Orders.Select(order => new OrderDto
                {
                    Id = order.Id,
                    StoreId = order.StoreId,
                    VoucherId = order.VoucherId,
                    Note = order.Note,
                    TotalPrice = order.TotalPrice,
                    Items = order.ProductDetails.Select(pd => new OrderItemDto
                    {
                        ProductDetailId = pd.Id,
                        Quantity = pd.Quantity,
                        Price = pd.Price
                    }).ToList()
                }).ToList()
            };
            var message = JsonSerializer.Serialize(checkoutDto);
            producer.ProduceMessageAsync("checkout", message, "checkout-topic");
            return ResponseModel.SuccessResponse();
        }
    }
}
