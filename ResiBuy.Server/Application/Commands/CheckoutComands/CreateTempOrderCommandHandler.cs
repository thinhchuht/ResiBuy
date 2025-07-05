using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public record CreateTempOrderCommand(string UserId, CreateTempOrderDto Dto) : IRequest<ResponseModel>;
    public class CreateTempOrderCommandHandler(IProductDetailDbService productDetailDbService, IRedisService redisService) : IRequestHandler<CreateTempOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateTempOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            if (string.IsNullOrEmpty(request.UserId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống");
            var db = redisService.GetDatabase();
            var groupedCartItems = dto.CartItems.GroupBy(ci => ci.StoreId);
            if(groupedCartItems.Count() > 10) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo quá 10 đơn hàng 1 lần");
            var tempOrders = new List<TempOrderDto>();
            foreach (var group in groupedCartItems)
            {
                var storeId = group.Key;
                var tempProductDetails = new List<TempProductDetailDto>();
                foreach (var ci in group)
                {
                    var productDetail = await productDetailDbService.GetByIdAsync(ci.ProductDetailId);
                    if (productDetail == null)
                        throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy sản phẩm với ProductDetailId: {ci.ProductDetailId}");

                    tempProductDetails.Add(new TempProductDetailDto(
                        productDetail.Id,
                        productDetail.Product.Name,
                        productDetail.IsOutOfStock,
                        productDetail.Weight,
                        productDetail.Price * (100 - productDetail.Product.Discount) / 100,
                        ci.Quantity,
                        new Image { Id = productDetail.Image.Id, Name = productDetail.Image.Name, ThumbUrl = productDetail.Image.ThumbUrl, Url = productDetail.Image.Url, ProductDetailId = productDetail.Id },
                        productDetail.AdditionalData.Select(ad => { ad.ProductDetail = null; return ad; }).ToList()
                    ));
                }
                var totalPrice = tempProductDetails.Sum(x => x.Price * x.Quantity);
                var tempOrder = new TempOrderDto
                {
                    Id = Guid.NewGuid(),
                    StoreId = storeId,
                    TotalPrice = totalPrice,
                    ProductDetails = tempProductDetails
                };
                tempOrders.Add(tempOrder);
            }

            var checkOutData = new TempCheckoutDto
            {
                Id = Guid.NewGuid(),
                Orders = tempOrders,
                GrandTotal = tempOrders.Sum(o => o.TotalPrice),
                IsInstance = dto.IsInstance
            };
            var cacheKey = $"temp_order:{request.UserId}-{checkOutData.Id}";
            var cacheValue = JsonSerializer.Serialize(checkOutData);
            await db.StringSetAsync(cacheKey, cacheValue, TimeSpan.FromMinutes(30));
            return ResponseModel.SuccessResponse(checkOutData.Id);
        }
    }
}
