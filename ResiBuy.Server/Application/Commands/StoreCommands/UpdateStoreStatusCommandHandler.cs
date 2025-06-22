using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;

namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreStatusCommand(
        Guid StoreId,
        bool IsLocked,
        bool IsOpen
    ) : IRequest<ResponseModel>;

    public class UpdateStoreStatusCommandHandler : IRequestHandler<UpdateStoreStatusCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public UpdateStoreStatusCommandHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(UpdateStoreStatusCommand command, CancellationToken cancellationToken)
        {
            await _storeDbService.UpdateStoreStatusAsync(command.StoreId, command.IsLocked, command.IsOpen);
            return ResponseModel.SuccessResponse();
        }
    }
} 