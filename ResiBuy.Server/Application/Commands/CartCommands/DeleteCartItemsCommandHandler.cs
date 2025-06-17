using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartItemsCommand(DeleteCartItemsDto Dto) : IRequest<ResponseModel>;
    public class DeleteCartItemsCommandHandler(ICartItemDbService cartItemDbService) : IRequestHandler<DeleteCartItemsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeleteCartItemsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var cartItem = await cartItemDbService.DeleteBatchAsync(command.Dto.CartItemIds);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
