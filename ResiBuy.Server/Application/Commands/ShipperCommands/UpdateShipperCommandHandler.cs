using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperCommand(
        Guid Id,
        float StartWorkTime,
        float EndWorkTime
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
            // 1. Kiểm tra sự tồn tại của shipper
            var shipper = await _shipperDbService.GetShipperByIdAsync(command.Id);
            if (shipper == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");
            if (command.StartWorkTime < 0 || command.StartWorkTime > 24)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
            if (command.EndWorkTime < 0 || command.EndWorkTime > 24)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian kết thúc làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
            if (command.StartWorkTime >= command.EndWorkTime)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian kết thúc làm việc phải lớn hơn thời gian bắt đầu làm việc.");

            
            // 2. Cập nhật thời gian làm việc
            shipper.StartWorkTime = command.StartWorkTime;
            shipper.EndWorkTime = command.EndWorkTime;

            // 3. Lưu thay đổi
            await _shipperDbService.UpdateAsync(shipper);

            return ResponseModel.SuccessResponse();
        }
    }
}
