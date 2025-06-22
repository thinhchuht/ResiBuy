using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperCommand(
        Guid Id,
        DateTime StartWorkTime,
        DateTime EndWorkTime
    ) : IRequest<ResponseModel>;

    public class UpdateShipperCommandHandler : IRequestHandler<UpdateShipperCommand, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public UpdateShipperCommandHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(UpdateShipperCommand command, CancellationToken cancellationToken)
        {
            var shipper = await _shipperDbService.GetShipperByIdAsync(command.Id);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");

            shipper.StartWorkTime = command.StartWorkTime;
            shipper.EndWorkTime = command.EndWorkTime;

            await _shipperDbService.UpdateAsync(shipper);

            return ResponseModel.SuccessResponse();
        }
    }
} 