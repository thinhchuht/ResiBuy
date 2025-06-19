using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartCommand(Guid Id, AddToCartDto AddToCartDto) : IRequest<ResponseModel>;
    public class AddToCartCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService,
        IBaseDbService<ProductDetail> baseProductDbService
        ) : IRequestHandler<AddToCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddToCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mã giỏ hàng");
                if (command.AddToCartDto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là lớn hơn 0");
                if (command.AddToCartDto.ProductDetailId == 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mã sản phẩm");
                var productDetail = await baseProductDbService.GetByIntIdBaseAsync(command.AddToCartDto.ProductDetailId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Sản phẩm không tồn tại");
                if (productDetail.IsOutOfStock) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Sản phẩm đã hết hàng");
                var cart = await cartDbService.GetByIdBaseAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                var existingItems = (await cartItemDbService.GetMatchingCartItemsAsync(command.Id, [command.AddToCartDto.ProductDetailId]));
                if (existingItems.Any())
                {
                    var existingItem = existingItems.FirstOrDefault();
                    existingItem.Quantity = command.AddToCartDto.IsAdd ? existingItem.Quantity + command.AddToCartDto.Quantity : command.AddToCartDto.Quantity;
                    if (existingItem.Quantity > 10)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 10 sản phẩm cùng 1 mặt hàng");
                    }
                    await cartItemDbService.UpdateAsync(existingItem);
                    return ResponseModel.SuccessResponse(existingItem);
                }

                var cartItem = new CartItem(command.AddToCartDto.Quantity, command.Id, command.AddToCartDto.ProductDetailId);
                await cartItemDbService.CreateAsync(cartItem);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
