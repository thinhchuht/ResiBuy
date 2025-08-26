namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record UpdateShipperCommand(
        Guid Id,
        float? StartWorkTime,
        float? EndWorkTime,
        bool? IsLocked 
    ) : IRequest<ResponseModel>;

    public class UpdateShipperCommandHandler : IRequestHandler<UpdateShipperCommand, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;
        private readonly INotificationService _notificationService;
        public UpdateShipperCommandHandler(IShipperDbService shipperDbService , INotificationService notificationService)
        {
            _shipperDbService = shipperDbService;
            _notificationService = notificationService;
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
            shipper.StartWorkTime = command.StartWorkTime ?? shipper.StartWorkTime;
            shipper.EndWorkTime = command.EndWorkTime ?? shipper.EndWorkTime;
            shipper.IsLocked = command.IsLocked ?? shipper.IsLocked;
            // 3. Lưu thay đổi
            await _shipperDbService.UpdateAsync(shipper);
            if (shipper.IsLocked)
                await _notificationService.SendNotificationAsync(Constants.ShipperLocked,
                            new { UserId = shipper.UserId },
                            Constants.AdminHubGroup, [shipper.UserId]);
            if (shipper.IsLocked == false)
                await _notificationService.SendNotificationAsync(Constants.ShipperUnlocked,
                            new { UserId = shipper.UserId },
                            Constants.AdminHubGroup, [shipper.UserId]);

            return ResponseModel.SuccessResponse();
        }
    }
}
