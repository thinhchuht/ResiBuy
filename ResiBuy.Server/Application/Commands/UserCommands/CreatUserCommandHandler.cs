namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class CreatUserCommandHandler(
        IUserDbService userDbService,
        IUserRoomDbService userRoomDbService,
        IRoomDbService roomDbService,
        IBaseDbService<Cart> baseCartDbService,
        INotificationService notificationService) : IRequestHandler<CreatUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCommand command, CancellationToken cancellationToken)
        {
            if (!command.RegisterDto.RoomIds.Any())
                return ResponseModel.FailureResponse("You cant create User without a room");

            var getRoomsResponse = await roomDbService.GetBatchAsync(command.RegisterDto.RoomIds);
            if (!getRoomsResponse.IsSuccess())
                return getRoomsResponse;

            var rooms = getRoomsResponse.Data as List<Room>;
            var createUserResponse = await userDbService.CreateUser(command.RegisterDto);

            if (createUserResponse.IsSuccess())
            {
                var user = createUserResponse.Data as User;
                var createRoomResponse = await userRoomDbService.CreateUserRoomsBatch([user.Id], command.RegisterDto.RoomIds);

                if (createRoomResponse.IsSuccess())
                {
                    var cart = new Cart(user.Id);
                    var createCartResponse = await baseCartDbService.CreateAsync(cart);

                    if (createCartResponse.IsSuccess())
                    {
                        var userResult = new UserQueryResult(
                            user.Id,
                            user.DateOfBirth,
                            user.IsLocked,
                            user.Roles,
                            user.FullName,
                            user.CreatedAt,
                            user.UpdatedAt,
                            cart.Id,
                            rooms.Select(r => new { r.Id, r.Name, r.BuildingId }),
                            [],
                            []
                        );
                        notificationService.SendNotification("UserCreated", userResult, Constants.AdminHubGroup);
                        return ResponseModel.SuccessResponse(userResult);
                    }
                    return createCartResponse;
                }
                return createRoomResponse;
            }
            return createUserResponse;
        }
    }
}
