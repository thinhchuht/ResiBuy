namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record UpdateUserCommand(string Code, string Id) : IRequest<ResponseModel>;
    public class UpdateUserCommandHandler(
        IUserDbService userDbService,
        IImageDbService imageDbService,
        INotificationService notificationService,
         ICodeGeneratorSerivce codeGeneratorSerivce) : IRequestHandler<UpdateUserCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
        {
            var rs = codeGeneratorSerivce.TryGetCachedData<UpdateUserDto>(command.Code, out var updateUserDto);
            if (!rs) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mã xác nhận đã hết hạn");
            // Get existing user
            var existingUser = await userDbService.GetUserById(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy người dùng");

            if (updateUserDto.Avatar == null && string.IsNullOrEmpty(updateUserDto.Email))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có thông tin nào mới để cập nhật");
            if (updateUserDto.Email != null)
            {
                await userDbService.CheckUniqueField(existingUser.Id, null, updateUserDto.Email);
                if(!Regex.IsMatch(updateUserDto.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
                existingUser.Email = updateUserDto.Email;
                //await mailService.SendEmailAsync(updateUserDto.Email, "Thêm Mail vào tài khoản", "<a>Click vào link để hoàn tất thêm mail vào tài khoản Resibuy </a>", true);
            }
            var imgResult = new Image();
            if (updateUserDto.Avatar != null)
            {
                var uploadResult = updateUserDto.Avatar;
                imgResult = new Image
                {
                    Id       = uploadResult.Id,
                    Url       = uploadResult.Url,
                    ThumbUrl = uploadResult.ThumbUrl,
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
                new AvatarQueryResult(updatedUser.Avatar.Id, updatedUser.Avatar.Name, updatedUser.Avatar.Url, updatedUser.Avatar.ThumbUrl),
                updatedUser.UserRooms.Select(ur => new RoomQueryResult(
                    ur.Room.Id,
                    ur.Room.Name,
                    ur.Room.Building.Name,
                    ur.Room.Building.Area.Name, ur.Room.Building.Area.Id)),
                [],
                [],
                []
            );

            await notificationService.SendNotificationAsync("UserUpdated", updatedUser, Constants.AdminHubGroup, [updatedUser.Id]);
            return ResponseModel.SuccessResponse(userResult);
        }
    }
}
