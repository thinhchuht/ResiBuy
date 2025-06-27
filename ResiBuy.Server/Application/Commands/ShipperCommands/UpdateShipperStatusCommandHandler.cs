using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperStatusCommand(
        Guid ShipperId,
        bool IsOnline
    ) : IRequest<ResponseModel>;

    public class UpdateShipperStatusCommandHandler : IRequestHandler<UpdateShipperStatusCommand, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public UpdateShipperStatusCommandHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(UpdateShipperStatusCommand command, CancellationToken cancellationToken)
        {
            await _shipperDbService.UpdateShipperStatusAsync(command.ShipperId, command.IsOnline);
            return ResponseModel.SuccessResponse(); 
        }
    }
} 