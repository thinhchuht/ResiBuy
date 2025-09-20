namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreateSimpleCustomerCommand(string FullName, string PhoneNumber) : IRequest<ResponseModel>;

    public class CreateSimpleCustomerCommandHandler : IRequestHandler<CreateSimpleCustomerCommand, ResponseModel>
    {
        private readonly IUserDbService _userDbService;
        private readonly INotificationService _notificationService;

        public CreateSimpleCustomerCommandHandler(
            IUserDbService userDbService,
            INotificationService notificationService)
        {
            _userDbService = userDbService;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel> Handle(CreateSimpleCustomerCommand command, CancellationToken cancellationToken)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(command.FullName))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên người dùng không được để trống");

            if (string.IsNullOrWhiteSpace(command.PhoneNumber) || !Regex.IsMatch(command.PhoneNumber, Constants.PhoneNumberPattern))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");

            // Create user
            var user = await _userDbService.CreateSimpleCustomerUser(command.FullName, command.PhoneNumber);

            // Map to UserQueryResult
            // Trong phương thức Handle của CreateSimpleCustomerCommandHandler
            var userResult = new UserQueryResult(
                user.Id,
                user.IdentityNumber,
                user.Email,
                user.PhoneNumber,
                user.DateOfBirth,
                user.IsLocked,
                user.Roles,
                user.FullName,
                user.CreatedAt,
                user.UpdatedAt,
              user.Cart.Id,
                user.Avatar != null ? new AvatarQueryResult(user.Avatar.Id, user.Avatar.Name, user.Avatar.Url, user.Avatar.ThumbUrl) : null,
                user.UserRooms.Select(ur => new RoomQueryResult(
                    ur.Room.Id,
                    ur.Room.Name,
                    ur.Room.Building.Name,
                    ur.Room.Building.Area.Name,
                    ur.Room.Building.Area.Id)),
                [],
                [],
                [],
                user.ReportCount
            );
            // Send notification
            await _notificationService.SendNotificationAsync(
                "UserCreated",
                user.Id,
                Constants.AdminHubGroup,
                [user.Id],
                false
            );

            return ResponseModel.SuccessResponse(userResult);
        }
    }
}