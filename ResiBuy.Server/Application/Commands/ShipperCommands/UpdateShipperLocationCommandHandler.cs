using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;
using ResiBuy.Server.Infrastructure.Model;
using System;
using System.Threading;
using System.Threading.Tasks;

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
            // Kiểm tra xem shipper có tồn tại hay không
             var shipper = await _shipperDbService.GetShipperByIdAsync(command.ShipperId);
             if (shipper == null)
                 throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại.");
            if (command.ShipperId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của shipper không hợp lệ.");

            // Kiểm tra xem LocationId có hợp lệ hay không
            if (command.LocationId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của khu vực không hợp lệ.");
        
            // 2. Cập nhật vị trí của shipper
            await _shipperDbService.UpdateShipperLocationAsync(command.ShipperId, command.LocationId);
            return ResponseModel.SuccessResponse();
        }
    }
}
