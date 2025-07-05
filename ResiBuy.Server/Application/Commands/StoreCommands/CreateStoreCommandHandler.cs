namespace ResiBuy.Server.Application.Commands.StoreCommands
{
    public record CreateStoreCommand(
        string Name,
        string Description,
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
            if (string.IsNullOrEmpty(command.OwnerId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id người dùng không hợp lệ.");

            // Kiểm tra xem người dùng có tồn tại hay không
            var user = await _userDbService.GetUserById(command.OwnerId);
            if (user == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Người dùng không tồn tại");
            if (await _storeDbService.CheckRoomIsAvailable(command.RoomId))
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Room đã có người sử dụng");
            if (!(await _storeDbService.CheckStoreIsAvailable(command.Name))) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên cửa hàng đã tồn tại, thử lại 1 tên khác.");
            var store = new Store
            {
                Name = command.Name,
                Description = command.Description,
                IsLocked = false,
                IsOpen = true,
                ReportCount = 0,
                CreatedAt = DateTime.Now,
                OwnerId = command.OwnerId,
                RoomId = command.RoomId
            };

            var newstore = await _storeDbService.CreateAsync(store);

            return ResponseModel.SuccessResponse(newstore);
        }
    }
}
