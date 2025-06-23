using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartItemsCommand(DeleteCartItemsDto Dto) : IRequest<ResponseModel>;
    public class DeleteCartItemsCommandHandler(ICartItemDbService cartItemDbService, INotificationService notificationService) : IRequestHandler<DeleteCartItemsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeleteCartItemsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var cartItem = await cartItemDbService.DeleteBatchAsync(command.Dto.CartItemIds);
                notificationService.SendNotification(Constants.CartItemDeleted, new { CartItemIds = command.Dto.CartItemIds }, "", [command.Dto.UserId]);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }

        }
    }
}
