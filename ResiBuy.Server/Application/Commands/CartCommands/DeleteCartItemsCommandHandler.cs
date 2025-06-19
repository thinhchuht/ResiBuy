using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartItemsCommand(Guid Id, DeleteCartItemsDto Dto) : IRequest<ResponseModel>;
    public class DeleteCartItemsCommandHandler(ICartItemDbService cartItemDbService, ICartDbService cartDbService) : IRequestHandler<DeleteCartItemsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeleteCartItemsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var cart = await cartDbService.GetByIdAsync(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại giỏ hàng");
                var missingCartItemIds = command.Dto.CartItemIds.Where(id => !cart.CartItems.Any(ci => ci.Id == id)).ToList();
                if (missingCartItemIds.Any())
                {
                    throw new CustomException(ExceptionErrorCode.NotFound,
                        $"Không tìm thấy sản phẩm với ID: {string.Join(", ", missingCartItemIds)} trong giỏ hàng");
                }
                var cartItem = await cartItemDbService.DeleteBatchAsync(command.Id, command.Dto.CartItemIds);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
