using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartCommand(Guid Id, AddToCartDto AddToCartDto) : IRequest<ResponseModel>;
    public class AddToCartCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService,
        IProductDetailDbService baseProductDbService, INotificationService notificationService
        ) : IRequestHandler<AddToCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddToCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.AddToCartDto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là lớn hơn 0");
                if (command.AddToCartDto.ProductDetailId == 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mã sản phẩm");
                var productDetail = await baseProductDbService.GetByIdAsync(command.AddToCartDto.ProductDetailId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Sản phẩm không tồn tại");
                if(!productDetail.Product.Category.Status) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Danh mục sản phẩm đã tạm thời ngừng hoạt động.");
                if (productDetail.Product.IsOutOfStock || productDetail.IsOutOfStock || productDetail.Quantity <= 0 || productDetail.Quantity < command.AddToCartDto.Quantity) throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Mặt hàng {productDetail.Product.Name} chỉ còn {productDetail.Quantity} sản phẩm");
                var cart = await cartDbService.GetByIdBaseAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                if (cart.UserId == productDetail.Product.Store.OwnerId) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể mua hàng từ chính cửa hàng của mình");
                var existingItems = (await cartItemDbService.GetMatchingCartItemsAsync(command.Id, [command.AddToCartDto.ProductDetailId]));
                if (existingItems.Any())
                {
                    if(cart.IsCheckingOut) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể thêm sản phẩm đã có khi đang trong quá trình thanh toán.");
                    var existingItem = existingItems.FirstOrDefault();
                    existingItem.Quantity = command.AddToCartDto.IsAdd ? existingItem.Quantity + command.AddToCartDto.Quantity : command.AddToCartDto.Quantity;
                    if (existingItem.Quantity > 10)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 10 sản phẩm cùng 1 mặt hàng");
                    }
                    if (existingItem.Quantity > productDetail.Quantity)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Chỉ còn {productDetail.Quantity} sản phẩm có sẵn");
                    }
                    await cartItemDbService.UpdateAsync(existingItem);
                    await notificationService.SendNotificationAsync(Constants.CartItemAdded, new { Id = existingItem.Id, existingItem.Quantity, CartId = cart.Id,  command.AddToCartDto.ProductDetailId }, "", [cart.UserId], false);
                    return ResponseModel.SuccessResponse(existingItem);
                }

                var cartItem = new CartItem(command.AddToCartDto.Quantity, command.Id, command.AddToCartDto.ProductDetailId);
                await cartItemDbService.CreateAsync(cartItem);
                await notificationService.SendNotificationAsync(Constants.CartItemAdded, new { Id = cartItem.Id, cartItem.Quantity, CartId = cart.Id, command.AddToCartDto.ProductDetailId }, "", [cart.UserId], false);

                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
