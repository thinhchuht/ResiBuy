namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record RemoveUserRoomCommand(string UserId, List<Guid> RoomId) : IRequest<ResponseModel>;

    public class RemoveUserRoomCommandHandler(
        IUserDbService userDbService,
        IRoomDbService roomDbService,
        IUserRoomDbService userRoomDbService)
        : IRequestHandler<RemoveUserRoomCommand, ResponseModel>
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

                var rooms = await roomDbService.GetBatchAsync(command.RoomId);
                if (rooms.Any(r => r == null))
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Một hoặc nhiều phòng không tồn tại");
                }

                var currentRoomIds = user.UserRooms?.Select(ur => ur.RoomId).ToHashSet() ?? new HashSet<Guid>();

                var notInRooms = rooms
                    .Where(r => !currentRoomIds.Contains(r.Id))
                    .ToList();

                var inRooms = rooms
                    .Where(r => currentRoomIds.Contains(r.Id))
                    .ToList();

                if (inRooms.Count == 0)
                {
                    throw new CustomException(ExceptionErrorCode.InvalidInput, "Người dùng không ở trong bất kỳ phòng nào được chọn");
                }

                foreach (var room in inRooms)
                {
                    await userRoomDbService.DeleteUserRoom(command.UserId, room.Id);
                }

                string message = $"Đã xóa người dùng {user.FullName} khỏi phòng: {string.Join(", ", inRooms.Select(r => r.Name))}.";

                if (notInRooms.Any())
                {
                    message += $" Người dùng không ở trong phòng: {string.Join(", ", notInRooms.Select(r => r.Name))}.";
                }

                return ResponseModel.SuccessResponse(message.Trim());
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}