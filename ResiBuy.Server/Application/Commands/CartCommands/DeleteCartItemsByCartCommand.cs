using ResiBuy.Server.Application.Commands.CartCommands.Dtos;
using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;

namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record DeleteCartItemsByCartCommand(DeleteCartItemsByCartCommandDto Dto) : IRequest<ResponseModel>;

    public class DeleteCartItemsByCartCommandHandler : IRequestHandler<DeleteCartItemsByCartCommand, ResponseModel>
    {
        private readonly ICartItemDbService _cartItemDbService;

        public DeleteCartItemsByCartCommandHandler(ICartItemDbService cartItemDbService)
        {
            _cartItemDbService = cartItemDbService;
        }

        public async Task<ResponseModel> Handle(DeleteCartItemsByCartCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var cartId = command.Dto.CartId;
                var cartItemIds = command.Dto.CartItemIds;

                if (cartItemIds == null || !cartItemIds.Any())
                {
                    return ResponseModel.FailureResponse("Danh sách cart item cần xóa trống.");
                }

                var deleted = await _cartItemDbService.DeleteByCartIdAndItemIdsAsync(cartId, cartItemIds);

                if (!deleted)
                {
                    return ResponseModel.FailureResponse("Không tìm thấy cart items cần xóa.");
                }

                return ResponseModel.SuccessResponse(cartItemIds);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
