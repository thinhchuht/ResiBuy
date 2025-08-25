namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record CreateStoreCommand(
        string Name,
        string Description,
        string PhoneNumber,
        string OwnerId,
        Guid RoomId
    ) : IRequest<ResponseModel>;

    public class CreateStoreCommandHandler : IRequestHandler<CreateStoreCommand, ResponseModel>
    {
        private readonly IStoreDbService _storeDbService;
        private readonly IUserDbService _userDbService;

        public CreateStoreCommandHandler(IStoreDbService storeDbService, IUserDbService userDbService)
        {
            _storeDbService = storeDbService;
            _userDbService = userDbService;
        }

        public async Task<ResponseModel> Handle(CreateStoreCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra xem OwnerId có hợp lệ hay không
            // Kiểm tra xem OwnerId có hợp lệ hay không
            if (string.IsNullOrEmpty(command.OwnerId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id người dùng không hợp lệ.");

            // Kiểm tra xem người dùng có tồn tại hay không
            var user = await _userDbService.GetUserById(command.OwnerId);
            if (user == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Người dùng không tồn tại");

            // Kiểm tra phòng có sẵn không
            if (await _storeDbService.CheckRoomIsAvailable(command.RoomId))
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Phòng đã tồn tại 1 cửa hàng khác");

            // Kiểm tra tên cửa hàng là bắt buộc
            if (string.IsNullOrWhiteSpace(command.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên cửa hàng là bắt buộc.");

            // Kiểm tra tên cửa hàng có trùng không
            if (await _storeDbService.CheckStoreIsAvailable(command.Name))
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Tên cửa hàng đã tồn tại, thử lại một tên khác.");

            // Kiểm tra số điện thoại là bắt buộc
            if (string.IsNullOrWhiteSpace(command.PhoneNumber))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại là bắt buộc.");

            // Kiểm tra định dạng số điện thoại
            if (!Regex.IsMatch(command.PhoneNumber, Constants.PhoneNumberPattern))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");

            // Kiểm tra số điện thoại có trùng với cửa hàng của OwnerId khác không
            if (await _storeDbService.CheckStorePhoneIsAvailable(command.PhoneNumber, command.OwnerId))
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Số điện thoại cửa hàng đã được sử dụng bởi người dùng khác, thử lại một số khác.");
            var store = new Store
            {
                Name = command.Name,    
                Description = command.Description,
                PhoneNumber = command.PhoneNumber,
                IsLocked = false,
                IsOpen = true,
                ReportCount = 0,
                CreatedAt = DateTime.Now,
                OwnerId = command.OwnerId,
                RoomId = command.RoomId
            };

            var newstore = await _storeDbService.CreateAsync(store);
            if (!user.Roles.Contains(Constants.SellerRole))
            {
                user.Roles.Add(Constants.SellerRole);
                await _userDbService.UpdateAsync(user);
            }
            return ResponseModel.SuccessResponse(newstore);
        }
    }
}
