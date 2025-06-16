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
                 throw new CustomException(ExceptionErrorCode.ValidationFailed,"Không thể tạo người dùng mà không có phòng");
            if (!command.RegisterDto.Roles.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có vài trò");
            if (!command.RegisterDto.IdentityNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số CCCD");
            if (!command.RegisterDto.PhoneNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số điện thoại");
            if (!command.RegisterDto.Roles.All(role => Constants.AllowedRoles.Contains(role)))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vai trò người dùng không hợp lệ");
            if (!string.IsNullOrEmpty(command.RegisterDto.Password))
            {
                command.RegisterDto.Password = Constants.DefaulAccountPassword;
            }
            if (!Regex.IsMatch(command.RegisterDto.PhoneNumber, Constants.PhoneNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");
            if (!string.IsNullOrEmpty(command.RegisterDto.Email) && !Regex.IsMatch(command.RegisterDto.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
            if (!Regex.IsMatch(command.RegisterDto.IdentityNumber, Constants.IndentityNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số CCCD/CMND không hợp lệ");
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
                            user.PhoneNumber,
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
