namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record RemoveUserRoomCommand(string UserId, Guid RoomId) : IRequest<ResponseModel>;
    public class RemoveUserRoomCommandHandler(
        IUserDbService userDbService, IRoomDbService roomDbService, IUserRoomDbService userRoomDbService): IRequestHandler<RemoveUserRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(RemoveUserRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userDbService.GetUserById(command.UserId);
                if (user == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
                }
                var room = await roomDbService.GetByIdAsync(command.RoomId);
                if (room == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại phòng");
                }
                var currentRoomIds = user.UserRooms?.Select(ur => ur.RoomId).ToHashSet() ?? new HashSet<Guid>();
                if (!currentRoomIds.Contains(command.RoomId))
                {
                    throw new CustomException(ExceptionErrorCode.InvalidInput, "Người dùng không ở trong phòng này");
                }
                await userRoomDbService.DeleteUserRoom(command.UserId, command.RoomId);
                return ResponseModel.SuccessResponse($"Đã xóa người dùng {user.FullName} khỏi phòng {room.Name}");
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}