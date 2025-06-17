namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record ChangeRoomCommand(string Id, List<Guid> NewRoomIds) : IRequest<ResponseModel>;
    public class ChangeRoomCommandHandler(
        IUserDbService userDbService,
        IRoomDbService roomDbService,
        IUserRoomDbService userRoomDbService) : IRequestHandler<ChangeRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ChangeRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var user = await userDbService.GetUserById(command.Id);
                if (user == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
                }

                var newRooms = await roomDbService.GetBatchAsync(command.NewRoomIds);
                if (newRooms.Any( r => r == null))
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Một hoặc nhiều phòng không tồn tại");
                }
                if (newRooms.Any(r => !r.IsActive))
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Một hoặc nhiều phòng không còn hoạt động");
                }

                var currentUserRooms = user.UserRooms?.Select(ur => ur.RoomId).ToList() ?? new List<Guid>();

                var roomsToRemove = currentUserRooms.Except(command.NewRoomIds).ToList();

                var roomsToAdd = command.NewRoomIds.Except(currentUserRooms).ToList();

                foreach (var roomId in roomsToRemove)
                {
                    await userRoomDbService.DeleteUserRoom(command.Id, roomId);
                }

                foreach (var roomId in roomsToAdd)
                {
                    await userRoomDbService.CreateUserRoom(command.Id, roomId);
                }
                var userResult = new UserQueryResult(
                    user.Id,
                    user.Email,
                    user.PhoneNumber,
                    user.DateOfBirth,
                    user.IsLocked,
                    user.Roles,
                    user.FullName,
                    user.CreatedAt,
                    user.UpdatedAt,
                    user.Cart.Id,
                    user.Avatar == null ? null : new AvatarQueryResult(user.Avatar.Id, user.Avatar.Name, user.Avatar.ImgUrl, user.Avatar.ThumbUrl),
                    user.UserRooms.Select(ur => new RoomQueryResult(ur.Room.Id, ur.Room.Name, ur.Room.Building.Name, ur.Room.Building.Area.Name)),
                    [],
                    []);
                return ResponseModel.SuccessResponse(userResult);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
