using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartCommand(Guid Id, AddToCartDto AddToCartDto) : IRequest<ResponseModel>;
    public class AddToCartCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService) : IRequestHandler<AddToCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddToCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                if (command.AddToCartDto.Quantity <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là lớn hơn 0");
                if (command.AddToCartDto.ProductDetailId <= 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id sản phẩm");
                var cart = await cartDbService.GetByIdAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");

                var existingItem = await cartItemDbService.GetProductInCartAsync(command.AddToCartDto.ProductDetailId, command.Id);

                if (existingItem != null)
                {
                    existingItem.Quantity = command.AddToCartDto.IsAdd ? existingItem.Quantity + command.AddToCartDto.Quantity : command.AddToCartDto.Quantity;
                    if (existingItem.Quantity > 10)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Chỉ được đặt tối đa 10 sản phẩm cùng 1 mặt hàng");
                    }
                    await cartItemDbService.UpdateAsync(existingItem);
                    return ResponseModel.SuccessResponse(existingItem);
                }

                var cartItem = await cartItemDbService.CreateAsync(new CartItem(command.AddToCartDto.Quantity, command.Id, command.AddToCartDto.ProductDetailId));
                return ResponseModel.SuccessResponse(cartItem);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
