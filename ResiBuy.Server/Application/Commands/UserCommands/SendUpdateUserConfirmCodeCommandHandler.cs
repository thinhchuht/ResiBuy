namespace ResiBuy.Server.Application.Commands.UserCommands
{

    public record SendUpdateUserConfirmCodeCommand(UpdateUserDto UpdateUserDto, string Id) : IRequest<ResponseModel>;
    public class SendUpdateUserConfirmCodeCommandHandler(
        IUserDbService userDbService,
        IMailBaseService mailBaseService,
        ICodeGeneratorSerivce codeGeneratorSerivce) : IRequestHandler<SendUpdateUserConfirmCodeCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(SendUpdateUserConfirmCodeCommand command, CancellationToken cancellationToken)
        {
            var existingUser = await userDbService.GetUserById(command.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy người dùng");
            if (command.UpdateUserDto.Avatar == null && string.IsNullOrEmpty(command.UpdateUserDto.Email))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có thông tin nào mới để cập nhật");
            if (string.IsNullOrEmpty(command.UpdateUserDto.Email)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Bạn cần cập nhật mail trước");
            await userDbService.CheckUniqueField(null, command.UpdateUserDto.Email);
            if (!Regex.IsMatch(command.UpdateUserDto.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
            var code = codeGeneratorSerivce.GenerateCodeAndCache(command.UpdateUserDto);
            //string htmlBody = $@"<p syle='font-size: 20px; padding:15px'>Mã xác nhận của bạn là:</p>
            //                     <h2 style='color:#2c3e50; font-weight:bold;'>{code}</h2>";
            //mailBaseService.SendEmailInAnotherThread(existingUser.Email, "Cập nhật thông tin", htmlBody);
            return ResponseModel.SuccessResponse(code);
        }
    }
}
