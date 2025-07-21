using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Application.Commands.CheckoutComands
{
    public record CreateTempOrderCommand(string UserId, CreateTempOrderDto Dto) : IRequest<ResponseModel>;
    public class CreateTempOrderCommandHandler(IProductDetailDbService productDetailDbService, IOrderDbService orderDbService, IUserDbService userDbService,
        IStoreDbService storeDbService, IRedisService redisService) : IRequestHandler<CreateTempOrderCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateTempOrderCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            if (string.IsNullOrEmpty(request.UserId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống");
            var user = await userDbService.GetUserById(request.UserId);
            if (user == null || !user.Roles.Contains(Constants.CustomerRole))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ có người mua hàng mới tạo được đơn hàng");
            var db = redisService.GetDatabase();
            var groupedCartItems = dto.CartItems.GroupBy(ci => ci.StoreId);
            if(groupedCartItems.Count() > 10) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo quá 10 đơn hàng 1 lần");
            var tempOrders = new List<TempOrderDto>();
            foreach (var group in groupedCartItems)
            {
                var storeId = group.Key;
                var store = await storeDbService.GetStoreByIdAsync(storeId);
                var tempProductDetails = new List<TempProductDetailDto>();
                foreach (var ci in group)
                {
                    var productDetail = await productDetailDbService.GetByIdAsync(ci.ProductDetailId);
                    if (productDetail == null)
                        throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy sản phẩm: {ci.ProductDetailId}");
                    if(productDetail.IsOutOfStock || productDetail.Quantity <= 0) throw new CustomException(ExceptionErrorCode.NotFound, $"Sản phẩm {productDetail.Product.Name} đã hết hàng");
                    if (productDetail.Quantity < ci.Quantity)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mặt hàng {productDetail.Product.Name} chỉ còn {productDetail.Quantity} sản phẩm có sẵn");
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
                //var shippingFee = await orderDbService.ShippingFeeCharged(user.UserRooms.First().RoomId, store.RoomId, tempProductDetails.Sum(ci => ci.Weight));
                var totalPrice = tempProductDetails.Sum(x => x.Price * x.Quantity) + 10000;
                var tempOrder = new TempOrderDto
                {
                    Id = Guid.NewGuid(),
                    StoreId = storeId,
                    TotalBeforeDiscount = Math.Round(tempProductDetails.Sum(x => x.Price * x.Quantity), MidpointRounding.AwayFromZero),
                    TotalPrice = Math.Round(tempProductDetails.Sum(x => x.Price * x.Quantity), MidpointRounding.AwayFromZero),
                    ProductDetails = tempProductDetails,
                    ShippingFee = 10000,
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
