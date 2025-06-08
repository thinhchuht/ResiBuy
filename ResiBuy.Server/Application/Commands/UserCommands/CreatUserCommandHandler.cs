using ResiBuy.Server.Infrastructure.DbServices.CartDbService;

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
                return ResponseModel.FailureResponse("You cant create User without a room");
            var createUserResponse = await userDbService.CreateUser(command.RegisterDto);
            
            if (createUserResponse != null)
            {
                var rooms = await roomDbService.GetBatchAsync(command.RegisterDto.RoomIds);
                var createRoomResponse = await userRoomDbService.CreateUserRoomsBatch([createUserResponse.Id], command.RegisterDto.RoomIds);

                if (createRoomResponse != null)
                {
                    var cart = new Cart(createUserResponse.Id);
                    var createCartResponse = await baseCartDbService.CreateAsync(cart);

                    if (createCartResponse != null)
                    {
                        var userResult = new UserQueryResult(
                            createUserResponse.Id,
                            createUserResponse.DateOfBirth,
                            createUserResponse.IsLocked,
                            createUserResponse.Roles,
                            createUserResponse.FullName,
                            createUserResponse.CreatedAt,
                            createUserResponse.UpdatedAt,
                            cart.Id,
                            rooms.Select(r => new { r.Id, r.Name, r.BuildingId }),
                            [],
                            []
                        );
                        notificationService.SendNotification("UserCreated", userResult, Constants.AdminHubGroup);
                        return ResponseModel.SuccessResponse(userResult);
                    }
                }
            }
            return ResponseModel.SuccessResponse(createUserResponse);
        }
    }
}
