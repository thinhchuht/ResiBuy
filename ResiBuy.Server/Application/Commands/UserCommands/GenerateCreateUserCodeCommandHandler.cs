namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record GenerateCreateUserCodeCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class  GenerateCreateUserCodeCommandHandler(
        IUserDbService userDbService,
        IMailBaseService mailBaseService,
        ICodeGeneratorSerivce codeGeneratorSerivce) : IRequestHandler< GenerateCreateUserCodeCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle( GenerateCreateUserCodeCommand command, CancellationToken cancellationToken)
        {
            if (!command.RegisterDto.RoomIds.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có phòng");
            if (!command.RegisterDto.IdentityNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số CCCD");
            if (!command.RegisterDto.PhoneNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số điện thoại");
            if (string.IsNullOrEmpty(command.RegisterDto.Password))
            {
                command.RegisterDto.Password = Constants.DefaulAccountPassword;
            }
            if (!Regex.IsMatch(command.RegisterDto.PhoneNumber, Constants.PhoneNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");
            if (!string.IsNullOrEmpty(command.RegisterDto.Email) && !Regex.IsMatch(command.RegisterDto.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
            if (!Regex.IsMatch(command.RegisterDto.IdentityNumber, Constants.IndentityNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số CCCD/CMND không hợp lệ");
            var rs = UserChecker.CheckUserInExcel(command.RegisterDto.IdentityNumber, command.RegisterDto.FullName, command.RegisterDto.DateOfBirth);
            await userDbService.CheckUniqueField(null, command.RegisterDto.PhoneNumber, command.RegisterDto.Email, command.RegisterDto.IdentityNumber);
            var code = codeGeneratorSerivce.GenerateCodeAndCache(command.RegisterDto, TimeSpan.FromMinutes(3));
            string htmlBody = $@"<p syle='font-size: 20px; padding:15px'>Mã xác nhận của bạn là:</p>
                                 <h2 style='color:#2c3e50; font-weight:bold;'>{code}</h2>
                                <p syle='font-size: 20px; padding:15px'> Vui lòng không chia sẻ với bất cứ ai để đảm bảo bảo mật cho tài khoản</p>";
            mailBaseService.SendEmailInAnotherThread(command.RegisterDto.Email, "Đăng kí tài khoản", htmlBody);
            return ResponseModel.SuccessResponse(code);
        }
    }
}