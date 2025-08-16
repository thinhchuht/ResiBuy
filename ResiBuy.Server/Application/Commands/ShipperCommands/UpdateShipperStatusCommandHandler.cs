using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;
using ResiBuy.Server.Infrastructure.Model;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperStatusCommand(
        Guid ShipperId,
        bool IsOnline,
        Guid AreaId
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
            // Kiểm tra xem ShipperId có hợp lệ hay không
            if (command.ShipperId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của shipper không hợp lệ.");
            // Kiểm tra xem shipper có tồn tại hay không
            var shipper = await _shipperDbService.GetShipperByIdAsync(command.ShipperId);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại.");
            // 2. Cập nhật trạng thái của shipper
            try
            {
                await _shipperDbService.UpdateShipperStatusAsync(command.ShipperId, command.IsOnline, command.AreaId);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật trạng thái của shipper: {ex.Message}");
            }
        }
    }
}
