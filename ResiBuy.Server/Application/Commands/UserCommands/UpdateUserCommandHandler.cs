namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record UpdateUserCommand(UpdateUserDto UpdateUserDto, string Id) : IRequest<ResponseModel>;
    public class UpdateUserCommandHandler(
        IUserDbService userDbService,
        ICloudinaryService cloudinaryService,
        IImageDbService imageDbService,
        INotificationService notificationService) : IRequestHandler<UpdateUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
        {
            // Get existing user
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null)
                return ResponseModel.FailureResponse("Không tìm thấy người dùng");

            if (command.UpdateUserDto.Avatar == null && string.IsNullOrEmpty(command.UpdateUserDto.Email))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có thông tin nào mới để cập nhật");
            if (command.UpdateUserDto.Email != null)
            {
                await userDbService.CheckUniqueField(null, command.UpdateUserDto.Email);
                if(!Regex.IsMatch(command.UpdateUserDto.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
                existingUser.Email = command.UpdateUserDto.Email;
                //await mailService.SendEmailAsync(command.UpdateUserDto.Email, "Thêm Mail vào tài khoản", "<a>Click vào link để hoàn tất thêm mail vào tài khoản Resibuy </a>", true);
            }
            var imgResult = new Image();
            if (command.UpdateUserDto.Avatar != null)
            {
                var uploadResult = await cloudinaryService.UploadFileAsync(command.UpdateUserDto.Avatar, command.UpdateUserDto.AvatarId);
                imgResult = new Image
                {
                    Id       = uploadResult.Id,
                    Url   = uploadResult.Url,
                    ThumbUrl = uploadResult.ThumbnailUrl,
                    Name     = uploadResult.Name,
                    UserId   = existingUser.Id
                };
                var existingImg = await imageDbService.GetImageByIdAsync(imgResult.Id);
                if (existingImg == null)
                    await imageDbService.CreateAsync(imgResult);
                else
                {
                    existingImg.UpdateImage(imgResult);
                    await imageDbService.UpdateAsync(existingImg);
                }
            }

            var updatedUser = await userDbService.UpdateAsync(existingUser);
            if (updatedUser == null)
                throw new CustomException(ExceptionErrorCode.UpdateFailed, "Cập nhật thông tin người dùng thất bại");

            var userResult = new UserQueryResult(
                updatedUser.Id,
                updatedUser.IdentityNumber,
                updatedUser.Email,
                updatedUser.PhoneNumber,
                updatedUser.DateOfBirth,
                updatedUser.IsLocked,
                updatedUser.Roles,
                updatedUser.FullName,
                updatedUser.CreatedAt,
                updatedUser.UpdatedAt,
                updatedUser.Cart.Id,
                new AvatarQueryResult(imgResult.Id, imgResult.Name, imgResult.Url, imgResult.ThumbUrl),
                updatedUser.UserRooms.Select(ur => new RoomQueryResult(
                    ur.Room.Id,
                    ur.Room.Name,
                    ur.Room.Building.Name,
                    ur.Room.Building.Area.Name)),
                [],
                []
            );

            notificationService.SendNotification("UserUpdated", updatedUser, Constants.AdminHubGroup, [updatedUser.Id]);
            return ResponseModel.SuccessResponse(userResult);
        }
    }
}
