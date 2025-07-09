namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record GenerateCreateUserCodeCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class  GenerateCreateUserCodeCommandHandler(
        IUserDbService userDbService,
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
            await userDbService.CheckUniqueField(command.RegisterDto.PhoneNumber, command.RegisterDto.Email, command.RegisterDto.IdentityNumber);
            var code = codeGeneratorSerivce.GenerateCodeAndCache(command.RegisterDto, TimeSpan.FromMinutes(3));
            return ResponseModel.SuccessResponse(code);
        }
    }
}