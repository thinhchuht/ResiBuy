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
        private readonly INotificationService _notificationService;
        public UpdateStoreStatusCommandHandler(IStoreDbService storeDbService, INotificationService notificationService)
        {
            _storeDbService = storeDbService;
            _notificationService = notificationService;
        }
        public async Task<ResponseModel> Handle(UpdateStoreStatusCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra xem Id có hợp lệ hay không
            if (command.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id của cửa hàng không hợp lệ.");
            // Kiểm tra xem cửa hàng có tồn tại hay không
            var store = await _storeDbService.GetStoreByIdAsync(command.StoreId);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại.");
            // 2. Cập nhật trạng thái cửa hàng
            try
            {
                await _storeDbService.UpdateStoreStatusAsync(command.StoreId, command.IsLocked, command.IsOpen);
                if(command.IsLocked) await _notificationService.SendNotificationAsync(Constants.StoreLocked,
                            new { StoreId = store.Id, StoreName = store.Name },
                            Constants.AdminHubGroup, [store.OwnerId]);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật trạng thái cửa hàng: {ex.Message}");
            }
        }
    }
}
