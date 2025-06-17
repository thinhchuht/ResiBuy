namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record ChangeNameOrPasswordCommand(string Id, ChangeNameOrPhoneDto Dto) : IRequest<ResponseModel>;
    public class ChangeNameOrPasswordCommandHandler(
        IUserDbService userDbService) : IRequestHandler<ChangeNameOrPasswordCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ChangeNameOrPasswordCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Id)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id người dùng");
            if (string.IsNullOrEmpty(command.Dto.Name) && string.IsNullOrEmpty(command.Dto.PhoneNumber)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có gì để thay đổi");
            var existingUser = await userDbService.GetUserById(command.Id) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if (!string.IsNullOrEmpty(command.Dto.Name) && !string.IsNullOrEmpty(command.Dto.PhoneNumber) && existingUser.FullName.Equals(command.Dto.Name) && existingUser.PhoneNumber.Equals(command.Dto.PhoneNumber))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có gì để thay đổi");
            if (!string.IsNullOrEmpty(command.Dto.Name)) existingUser.FullName = command.Dto.Name;
            if (!string.IsNullOrEmpty(command.Dto.PhoneNumber))
            {
                await userDbService.CheckUniqueField(command.Dto.PhoneNumber);
                if (!Regex.IsMatch(command.Dto.PhoneNumber, Constants.PhoneNumberPattern))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");
                existingUser.PhoneNumber = command.Dto.PhoneNumber; 
            }
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(new UserQueryResult(
                updatedUser.Id,
                updatedUser.Email,
                updatedUser.PhoneNumber,
                updatedUser.DateOfBirth,
                updatedUser.IsLocked,
                updatedUser.Roles,
                updatedUser.FullName,
                updatedUser.CreatedAt,
                updatedUser.UpdatedAt,
                updatedUser.Cart.Id,
                updatedUser.Avatar == null ? null : new AvatarQueryResult(updatedUser.Avatar.Id, updatedUser.Avatar.Name, updatedUser.Avatar.ImgUrl, updatedUser.Avatar.ThumbUrl),
                updatedUser.UserRooms.Select(ur => new RoomQueryResult(ur.Room.Id, ur.Room.Name, ur.Room.Building.Name, ur.Room.Building.Area.Name)),
                [],
                []));
        }
    }
}
