namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record AddUsersToRoomCommand(List<string> UserIds, List<Guid> RoomIds) : IRequest<ResponseModel>;

    public class AddUsersToRoomCommandHandler(
        IUserDbService userDbService,
                                         IRoomDbService roomDbService, INotificationService notificationService,
        IUserRoomDbService userRoomDbService): IRequestHandler<AddUsersToRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(AddUsersToRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var users = new List<User>();
                var invalidUserIds = new List<string>();

                foreach (var userId in command.UserIds)
                {
                    var user = await userDbService.GetUserById(userId);
                    if (user == null)
                    {
                        invalidUserIds.Add(userId);
                    }
                    else
                    {
                        users.Add(user);
                    }
                }

                if (invalidUserIds.Any())
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tồn tại người dùng: {string.Join(", ", invalidUserIds)}");
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

                var resultMessages = new List<string>();

                foreach (var user in users)
                {
                    var currentRoomIds = user.UserRooms?.Select(ur => ur.RoomId).ToHashSet() ?? new HashSet<Guid>();
                    var alreadyInRooms = newRooms.Where(r => currentRoomIds.Contains(r.Id)).ToList();
                    var roomsToAdd = newRooms.Where(r => !currentRoomIds.Contains(r.Id)).ToList();

                    foreach (var room in roomsToAdd)
                    {
                        await userRoomDbService.CreateUserRoom(user.Id, room.Id);
                    }

                    var message = "";
                    if (roomsToAdd.Any())
                    {
                        message += $"Đã thêm người dùng {user.FullName} vào phòng: {string.Join(", ", roomsToAdd.Select(r => r.Name))}. ";
                    }

                    if (alreadyInRooms.Any())
                    {
                        message += $"Người dùng {user.FullName} đã ở trong phòng: {string.Join(", ", alreadyInRooms.Select(r => r.Name))}.";
                    }

                    resultMessages.Add(message.Trim());
                }
                var ids = users.Select(u => u.Id).ToList();
                await notificationService.SendNotificationAsync("UserUpdated", ids, Constants.AdminHubGroup, ids, false);

                return ResponseModel.SuccessResponse(string.Join("", resultMessages));
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }}