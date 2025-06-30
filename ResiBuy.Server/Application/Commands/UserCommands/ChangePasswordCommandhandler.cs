namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record ChangePasswordCommand(string Id, string OldPassword, string NewPassword) : IRequest<ResponseModel>;
    public class ChangePasswordCommandHandler(
        IUserDbService userDbService) : IRequestHandler<ChangePasswordCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Id)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id người dùng");
            if(string.IsNullOrEmpty(command.OldPassword)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mật khẩu hiện tại");
            if (string.IsNullOrEmpty(command.NewPassword)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mật khẩu mới");
            if (!Regex.IsMatch(command.NewPassword, Constants.PasswordPattern))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu phải có 8 kí tự với ít nhất 1 chữ thường, 1 chữ in hoa, 1 số");
            if (command.OldPassword == command.NewPassword) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu mới không được trùng với mật khẩu hiện tại");
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if (existingUser.Roles.Contains("ADMIN")) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được đổi mật khẩu Admin");
            var result = CustomPasswordHasher.VerifyPassword(command.OldPassword, existingUser.PasswordHash);
            if(!result)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu hiện tại không đúng");
            existingUser.PasswordHash = CustomPasswordHasher.HashPassword(command.NewPassword);
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(updatedUser);
        }
    }
}
