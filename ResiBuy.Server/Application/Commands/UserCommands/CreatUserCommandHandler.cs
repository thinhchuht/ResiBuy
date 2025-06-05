namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class CreatUserCommandHandler(IUserService userService, IUserRoomService userRoomService, IRoomService roomService, IBaseService<Cart> baseCartService) : IRequestHandler<CreatUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCommand command, CancellationToken cancellationToken)
        {
            if (command.RegisterDto.RoomIds.Any()) return ResponseModel.FailureResponse("You cant create User without a room");
            var getRoomsResponse = await roomService.GetBatchAsync(command.RegisterDto.RoomIds);
            if (!getRoomsResponse.IsSuccess()) return getRoomsResponse;
            var rooms = getRoomsResponse.Data as List<Room>;
            var createUserResponse = await userService.CreateUser(command.RegisterDto);
            if (createUserResponse.IsSuccess())
            {
                    var user = createUserResponse.Data as User;
                    var createRoomResponse = await userRoomService.CreateUserRoomsBatch([user.Id], command.RegisterDto.RoomIds);
                    if (createRoomResponse.IsSuccess())
                    {
                        var cart = new Cart(user.Id);
                        var createCartResponse = await baseCartService.CreateAsync(cart);
                        return ResponseModel.SuccessResponse(new UserQueryResult(user.Id, user.DateOfBirth, user.IsLocked, user.Roles, user.FullName,
                            user.CreatedAt, user.UpdatedAt, cart.Id, rooms.Select(r => new { r.Id, r.Name, r.BuildingId}), [], []));
                    }
                    return createRoomResponse;
            }
            return createUserResponse;
        }
    }
}
