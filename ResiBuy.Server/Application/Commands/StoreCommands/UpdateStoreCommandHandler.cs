namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record UpdateStoreCommand(
        Guid Id,
        string Name,
        string PhoneNumber,
        string Description,
        Guid? RoomId
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
            try
            {
                // Kiểm tra Id có hợp lệ hay không
                if (command.Id == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id không hợp lệ.");

                // Kiểm tra cửa hàng có tồn tại hay không
                var store = await _storeDbService.GetStoreByIdAsync(command.Id);
                if (store == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại.");

                // Kiểm tra tên cửa hàng là bắt buộc
                if (string.IsNullOrWhiteSpace(command.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên cửa hàng là bắt buộc.");

                // Kiểm tra tên cửa hàng có trùng không
                if (await _storeDbService.CheckStoreNameWithIdAsync(command.Name, command.Id))
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, "Tên cửa hàng đã tồn tại, thử lại một tên khác.");

                // Kiểm tra số điện thoại là bắt buộc
                if (string.IsNullOrWhiteSpace(command.PhoneNumber))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại là bắt buộc.");

                // Kiểm tra định dạng số điện thoại
                if (!Regex.IsMatch(command.PhoneNumber, Constants.PhoneNumberPattern))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ.");

                // Kiểm tra số điện thoại có trùng với cửa hàng của OwnerId khác không
                if (await _storeDbService.CheckStorePhoneWithIdAsync(command.PhoneNumber, command.Id, store.OwnerId))
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, "Số điện thoại cửa hàng đã được sử dụng bởi người dùng khác, thử lại một số khác.");

                // Kiểm tra RoomId nếu không null
                if (command.RoomId.HasValue && command.RoomId != store.RoomId)
                {
                    if (await _storeDbService.CheckRoomIsAvailable(command.RoomId.Value, command.Id))
                        throw new CustomException(ExceptionErrorCode.DuplicateValue, "Phòng đã được sử dụng bởi một cửa hàng khác.");
                }

                // Cập nhật thông tin cửa hàng
                store.Name = command.Name;
                store.Description = command.Description;
                store.PhoneNumber = command.PhoneNumber;
                store.RoomId = command.RoomId ?? store.RoomId; // Giữ RoomId hiện tại nếu command.RoomId là null

                await _storeDbService.UpdateAsync(store);

                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed, $"Không thể cập nhật thông tin cửa hàng: {ex.Message}");
            }
        }
    }

}