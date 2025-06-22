using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreCommand(
        Guid Id,
        string Name,
        string Description
    ) : IRequest<ResponseModel>;

    public class UpdateStoreCommandHandler : IRequestHandler<UpdateStoreCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public UpdateStoreCommandHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(UpdateStoreCommand command, CancellationToken cancellationToken)
        {
            var store = await _storeDbService.GetStoreByIdAsync(command.Id);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Store không tồn tại");

            store.Name = command.Name;
            store.Description = command.Description;

            await _storeDbService.UpdateAsync(store);

            return ResponseModel.SuccessResponse();
        }
    }
} 