using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartItemsCommand(DeleteCartItemsDto Dto) : IRequest<ResponseModel>;
    public class DeleteCartItemsCommandHandler(ICartItemDbService cartItemDbService, IUserDbService userDbService, INotificationService notificationService) : IRequestHandler<DeleteCartItemsCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeleteCartItemsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userDbService.GetUserById(command.Dto.UserId)?? throw new CustomException(ExceptionErrorCode.NotFound,"Không tồn tại người dùng");
                if(user.Cart.IsCheckingOut) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể xóa sản phẩm khi đang trong quá trình thanh toán.");
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
