using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartItemDtos;

namespace ResiBuy.Server.Application.Commands.CartitemCommands
{

    public record UpdateCartItemQuantityCommand(Guid Id, UpdateQuantityCartItemDto Dto) : IRequest<ResponseModel>;
    public class UpdateCartItemQuantityCommandHandler(ICartItemDbService cartItemDbService) : IRequestHandler<UpdateCartItemQuantityCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateCartItemQuantityCommand query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.Id == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id item");
                if (query.Dto.Quantity > 0) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng phải là số nguyên lớn hơn 0");
                var cartItem = await cartItemDbService.GetByIdBaseAsync(query.Id);
                if (query.Dto.Quantity == 0) return await cartItemDbService.DeleteBatchAsync([query.Id]);
                cartItem.UpdateQuantity(query.Dto.Quantity);
                await cartItemDbService.UpdateAsync(cartItem);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
