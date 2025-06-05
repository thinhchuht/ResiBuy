namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class CreatUserCommandHandler(IUserService userService, IUserRoomService userRoomService, IBaseService<Cart> baseCartService) : IRequestHandler<CreatUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCommand command, CancellationToken cancellationToken)
        {
            var createUserResponse = await userService.CreateUser(command.RegisterDto);
            if (createUserResponse.IsSuccess())
            {
                var getUserResponse = await userService.GetUserAsync(null, command.RegisterDto.IdentityNumber);
                if (getUserResponse.IsSuccess())
                {
                    var user = getUserResponse.Data as User;
                    var createRoomResponse = await userRoomService.CreateUserRoomsBatch([user.Id], command.RegisterDto.RoomIds);
                    if (createRoomResponse.IsSuccess())
                    {
                        var cart = new Cart(user.Id);
                        var createCartResponse = await baseCartService.CreateAsync(cart);
                        return ResponseModel.SuccessResponse(new UserQueryResult(user.Id, user.DateOfBirth, user.IsLocked, user.Roles, user.FullName,
                            user.CreatedAt, user.UpdatedAt, cart.Id, user.UserRooms.Select(ur => new { ur.RoomId, ur.Room.Name, ur.Room.BuildingId}), user.UserVouchers.Select(ur => ur.VoucherId), user.Reports));
                    }
                    return createRoomResponse;
                }
            }
            return createUserResponse;
        }
    }
}
