namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class CreatUserCommandHandler(
        IUserDbService userDbService,
        IRoomDbService roomDbService,
        IUserRoomDbService userRoomDbService,
        ICartDbService baseCartDbService,
        INotificationService notificationService) : IRequestHandler<CreatUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCommand command, CancellationToken cancellationToken)
        {
            if (!command.RegisterDto.RoomIds.Any())
                return ResponseModel.FailureResponse("Không thể tạo người dùng mà không có phòng");
            var user = await userDbService.CreateUser(command.RegisterDto);

            if (user != null)
            {
                var rooms = await roomDbService.GetBatchAsync(command.RegisterDto.RoomIds);
                var userRoom = await userRoomDbService.CreateUserRoomsBatch([user.Id], command.RegisterDto.RoomIds);

                if (userRoom != null)
                {
                    var newCart = new Cart(user.Id);
                    var cart = await baseCartDbService.CreateAsync(newCart);

                    if (cart != null)
                    {
                        var userResult = new UserQueryResult(
                            user.Id,
                            user.Email,
                            user.DateOfBirth,
                            user.IsLocked,
                            user.Roles,
                            user.FullName,
                            user.CreatedAt,
                            user.UpdatedAt,
                            cart.Id,
                            null,
                            rooms.Select(r => new RoomQueryResult(r.Id, r.Name, r.Building.Name, r.Building.Area.Name)),
                            [],
                            []
                        );
                        notificationService.SendNotification("UserCreated", userResult, Constants.AdminHubGroup);
                        return ResponseModel.SuccessResponse(userResult);
                    }
                }
            }
            return ResponseModel.SuccessResponse(user);
        }
    }
}
