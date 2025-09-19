using ResiBuy.Server.Application.Commands.CartCommands.Dtos;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartCommand(ClearCartCommand Dto) : IRequest<ResponseModel>;

    public class DeleteCartCommandHandler(
        ICartDbService cartDbService
    ) : IRequestHandler<DeleteCartCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(DeleteCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var cartId = command.Dto.CartId;

                var deleted = await cartDbService.DeleteAsync(cartId);

                // Trả về response
                return ResponseModel.SuccessResponse("Xóa giỏ hàng thành công");
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
