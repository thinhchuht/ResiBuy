namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCommand(RegisterDTO RegisterDTO) : IRequest<ResponseModel>;
    public class CreatUserCommandHandler(IUserService userService, IUserRoomService userRoomService) : IRequestHandler<CreatUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCommand command, CancellationToken cancellationToken)
        {
            var createUserResponse = await userService.CreateUser(command.RegisterDTO);
            if (createUserResponse.IsSuccess())
            {
                var getUserResponse = await userService.GetUserAsync(null, command.RegisterDTO.IdentityNumber);
                if (getUserResponse.IsSuccess())
                {
                    var user = getUserResponse.Data as User;
                    var createRoomResponse = await userRoomService.CreateUserRoomsBatch([user.Id], command.RegisterDTO.RoomIds);
                    if (createRoomResponse.IsSuccess())
                    {
                        return ResponseModel.SuccessResponse(getUserResponse);
                    }
                }
            }
            return createUserResponse;
        }
    }
}
