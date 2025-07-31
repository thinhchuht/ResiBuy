namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record AddUserToRoomCommand(string UserId, List<Guid> RoomIds) : IRequest<ResponseModel>;

    public class AddUserToRoomCommandHandler(
        IUserDbService userDbService,
        IRoomDbService roomDbService,
        IUserRoomDbService userRoomDbService)
        : IRequestHandler<AddUserToRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddUserToRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userDbService.GetUserById(command.UserId);
                if (user == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
                }
                var newRooms = await roomDbService.GetBatchAsync(command.RoomIds);
                if (newRooms.Any(r => r == null))
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Một hoặc nhiều phòng không tồn tại");
                }

                if (newRooms.Any(r => !r.IsActive))
                {
                    throw new CustomException(ExceptionErrorCode.InvalidInput, "Một hoặc nhiều phòng không còn hoạt động");
                }
                var currentRoomIds = user.UserRooms?.Select(ur => ur.RoomId).ToHashSet() ?? new HashSet<Guid>();

                var roomsToAdd = command.RoomIds.Where(id => !currentRoomIds.Contains(id)).ToList();

                foreach (var roomId in roomsToAdd)
                {
                    await userRoomDbService.CreateUserRoom(command.UserId, roomId);
                }

                return ResponseModel.SuccessResponse($"Đã thêm {roomsToAdd.Count} phòng cho người dùng.");
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}