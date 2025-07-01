using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public class CreateTempCartItemDto
    {
        public Guid? Id { get; set; }
        public int ProductDetailId { get; set; }
        public int Quantity { get; set; }
        public Guid? CartId { get; set; }
    }

    public record CreateTempOrderCommand(string UserId, List<CreateTempCartItemDto> CartItems) : IRequest<ResponseModel>;
    public class CreateTempOrderCommandHandler(ICartItemDbService cartItemDbService, IProductDetailDbService productDetailDbService, IRedisService redisService) : IRequestHandler<CreateTempOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateTempOrderCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.UserId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống");

            var db = redisService.GetDatabase();
            var cartItems = new List<CartItem>();
            foreach (var ci in request.CartItems)
            {
                var productDetail = await productDetailDbService.GetByIdAsync(ci.ProductDetailId);
                if (productDetail == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy sản phẩm với ProductDetailId: {ci.ProductDetailId}");
                var item = new CartItem
                {
                    Id = ci.Id ?? Guid.NewGuid(),
                    CartId = ci.CartId ?? Guid.Empty,
                    ProductDetailId = ci.ProductDetailId,
                    Quantity = ci.Quantity,
                    ProductDetail = productDetail
                };
                cartItems.Add(item);
            }

            var grouped = cartItems.GroupBy(ci => ci.ProductDetail.Product.StoreId);
            var tempOrders = new List<TempOrderDto>();
            foreach (var group in grouped)
            {
                var storeId = group.Key;
                var totalPrice = group.Sum(ci => ci.ProductDetail.Price * ci.Quantity);
                var tempOrder = new TempOrderDto
                {
                    Id = Guid.NewGuid(),
                    StoreId = storeId,
                    TotalPrice = totalPrice,
                    ProductDetails = group.Select(ci =>
                        new TempProductDetailDto(
                            ci.ProductDetailId,
                            ci.ProductDetail.Product.Name,
                            ci.ProductDetail.IsOutOfStock,
                            ci.ProductDetail.Weight,
                            ci.ProductDetail.Price * (100 - ci.ProductDetail.Product.Discount) / 100,
                            ci.Quantity,
                            ci.ProductDetail.Image,
                            ci.ProductDetail.AdditionalData
                        )
                    ).ToList()
                };
                tempOrders.Add(tempOrder);
            }

            var isInstance = request.CartItems.Count == 1;
            var checkOutData = new TempCheckoutDto
            {
                Id = Guid.NewGuid(),
                Orders = tempOrders,
                GrandTotal = tempOrders.Sum(o => o.TotalPrice),
                IsInstance = isInstance
            };
            var cacheKey = $"temp_checkout:{request.UserId}-{checkOutData.Id}";
            var cacheValue = JsonSerializer.Serialize(checkOutData);
            await db.StringSetAsync(cacheKey, cacheValue, TimeSpan.FromMinutes(30));
            return ResponseModel.SuccessResponse(checkOutData.Id);
        }
    }
}
