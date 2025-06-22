using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperLocationCommand(
        Guid ShipperId,
        Guid LocationId
    ) : IRequest<ResponseModel>;

    public class UpdateShipperLocationCommandHandler : IRequestHandler<UpdateShipperLocationCommand, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public UpdateShipperLocationCommandHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(UpdateShipperLocationCommand command, CancellationToken cancellationToken)
        {
            await _shipperDbService.UpdateShipperLocationAsync(command.ShipperId, command.LocationId);
            return ResponseModel.SuccessResponse();
        }
    }
} 