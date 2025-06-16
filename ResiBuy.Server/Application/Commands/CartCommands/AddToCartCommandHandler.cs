using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record AddToCartCommand(Guid Id, AddToCartDto AddToCartDto) : IRequest<ResponseModel>;
    public class AddToCartCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService) : IRequestHandler<AddToCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddToCartCommand query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id giỏ hàng");
                if (query.AddToCartDto.Quantity > 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là số nguyên lớn hơn 0");
                if (query.AddToCartDto.ProductId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id sản phẩm");
                var cart = await cartDbService.GetByIdAsync(query.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng không tồn tại");
                var cartItem = await cartItemDbService.CreateAsync(new CartItem(query.AddToCartDto.Quantity, query.Id, query.AddToCartDto.ProductId));
                return ResponseModel.SuccessResponse(cartItem);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
