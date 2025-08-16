namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record SendPasswordConfirmCodeCommand(string Id, ChangePasswordDto ChangePasswordDto) : IRequest<ResponseModel>;
    public class SendPasswordConfirmCodeCommandHandler(
        IUserDbService userDbService,
        IMailBaseService mailBaseService,
        ICodeGeneratorSerivce codeGeneratorSerivce) : IRequestHandler<SendPasswordConfirmCodeCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(SendPasswordConfirmCodeCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Id)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id người dùng");
            if (string.IsNullOrEmpty(command.ChangePasswordDto.OldPassword)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mật khẩu hiện tại");
            if (string.IsNullOrEmpty(command.ChangePasswordDto.NewPassword)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu mật khẩu mới");
            if (!Regex.IsMatch(command.ChangePasswordDto.NewPassword, Constants.PasswordPattern))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu phải có 8 kí tự với ít nhất 1 chữ thường, 1 chữ in hoa, 1 số");
            if (command.ChangePasswordDto.OldPassword == command.ChangePasswordDto.NewPassword) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu mới không được trùng với mật khẩu hiện tại");
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if (existingUser.Roles.Contains("ADMIN")) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được đổi mật khẩu Admin");
            var result = CustomPasswordHasher.VerifyPassword(command.ChangePasswordDto.OldPassword, existingUser.PasswordHash);
            if (!result)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu hiện tại không đúng");
            var code = codeGeneratorSerivce.GenerateCodeAndCache(command.ChangePasswordDto);
            string htmlBody = $@"<p syle='font-size: 20px; padding:15px'>Mã xác nhận của bạn là:</p>
                                 <h2 style='color:#2c3e50; font-weight:bold;'>{code}</h2>";
            mailBaseService.SendEmailInAnotherThread(existingUser.Email, "Đổi mật khẩu", htmlBody);
            return ResponseModel.SuccessResponse(code);
        }
    }
}
