namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreCommand(
        Guid Id,
        string Name,
        string PhoneNumber,
        string Description
    ) : IRequest<ResponseModel>;

    public class UpdateStoreCommandHandler : IRequestHandler<UpdateStoreCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;

        public UpdateStoreCommandHandler(IStoreDbService storeDbService)
        {
            _storeDbService = storeDbService;
        }

        public async Task<ResponseModel> Handle(UpdateStoreCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra xem Id có hợp lệ hay không
            if (command.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id không hợp lệ.");
            // Kiểm tra xem cửa hàng có tồn tại hay không
            var store = await _storeDbService.GetStoreByIdAsync(command.Id);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại.");
            //if ((await _storeDbService.CheckStorePhoneIsAvailable(command.PhoneNumber))) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại cửa hàng đã tồn tại, thử lại 1 số khác.");
            if (!Regex.IsMatch(command.PhoneNumber, Constants.PhoneNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");
            // 2. Cập nhật thông tin cửa hàng
            try
            {
                var store1 = await _storeDbService.GetStoreByIdAsync(command.Id);
                store.Name = command.Name;
                store.Description = command.Description;
                store.PhoneNumber = command.PhoneNumber;
                await _storeDbService.UpdateAsync(store1);
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                // Xử lý lỗi
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật thông tin cửa hàng: {ex.Message}");
            }
        }
    }
}
