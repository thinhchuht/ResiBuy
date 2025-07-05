using MediatR;
using ResiBuy.Server.Infrastructure.Model;
using ResiBuy.Server.Exceptions;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperIsShippingCommand(Guid ShipperId, bool IsShipping) : IRequest<ResponseModel>;

    public class UpdateShipperIsShippingCommandHandler : IRequestHandler<UpdateShipperIsShippingCommand, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;
        public UpdateShipperIsShippingCommandHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }
        public async Task<ResponseModel> Handle(UpdateShipperIsShippingCommand command, CancellationToken cancellationToken)
        {
            if (command.ShipperId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của shipper không hợp lệ.");
            var shipper = await _shipperDbService.GetShipperByIdAsync(command.ShipperId);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Shipper này không tồn tại.");
            shipper.IsShipping = command.IsShipping;
            await _shipperDbService.UpdateShipperAsync(shipper);
            return ResponseModel.SuccessResponse();
        } 
    }
} 