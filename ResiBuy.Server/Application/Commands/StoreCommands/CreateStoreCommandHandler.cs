using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;
using ResiBuy.Server.Infrastructure.DbServices.UserDbServices;
using ResiBuy.Server.Infrastructure.Model;

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
            // Kiểm tra user có tồn tại không
            var user = await _userDbService.GetUserById(command.OwnerId);
            if (user == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Người dùng không tồn tại");
            if (await _storeDbService.CheckRoomIsAvailable(command.RoomId))
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Room đã có người sử dụng");

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