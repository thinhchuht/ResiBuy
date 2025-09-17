using Microsoft.AspNetCore.Identity;
using static ResiBuy.Server.Controllers.CartController;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record UpdateCartUserCommand(Guid CartId, UpdateCartUserRequest Request) : IRequest<ResponseModel>;

    public class UpdateCartUserCommandHandler(ICartDbService cartRepository,IUserDbService userDbService)
        : IRequestHandler<UpdateCartUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateCartUserCommand command, CancellationToken cancellationToken)
        {
            var cart = await cartRepository.GetByIdAsync(command.CartId);
            if (cart == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy giỏ hàng");
            var user = await userDbService.GetUserAsync(command.Request.UserId);
            if (user == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "User không tồn tại");


            await cartRepository.UpdateAsync(cart);

            return ResponseModel.SuccessResponse(new
            {
                cart.Id,
                cart.UserId,
                cart.IsCheckingOut,
                cart.ExpiredCheckOutTime
            });
        }
    }

}
