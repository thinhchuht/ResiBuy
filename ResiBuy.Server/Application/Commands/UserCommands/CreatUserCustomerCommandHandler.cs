namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record CreatUserCustomerCommand(RegisterDto RegisterDto) : IRequest<ResponseModel>;
    public class CreatUserCustomerCommandHandler(
        IUserDbService userDbService,
        IRoomDbService roomDbService, ICodeGeneratorSerivce codeGeneratorSerivce,
        INotificationService notificationService) : IRequestHandler<CreatUserCustomerCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreatUserCustomerCommand command, CancellationToken cancellationToken)
        {
            RegisterDto registerDto;
            if(string.IsNullOrEmpty(command.RegisterDto.Code))
            {
                registerDto = command.RegisterDto;
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
                if (!Regex.IsMatch(command.RegisterDto.Password, Constants.PasswordPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mật khẩu phải có ít nhất 8 kí tự với 1 số, 1 chữ hoa và 1 chữ thường");
                await userDbService.CheckUniqueField(null, command.RegisterDto.PhoneNumber, command.RegisterDto.Email, command.RegisterDto.IdentityNumber);
            }
            else
            {
                var rs = codeGeneratorSerivce.TryGetCachedData<RegisterDto>(command.RegisterDto.Code, out var registerDtoRs);
                if (!rs) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Mã xác nhận đã hết hạn");
                registerDto = registerDtoRs;
            }
            var user = await userDbService.CreateCustomerUser(registerDto);
            if (user != null)
            {
                var rooms = await roomDbService.GetBatchAsync(registerDto.RoomIds);
                if (rooms.Any(r => r == null))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Một hoặc nhiều phòng không tồn tại");
                if (rooms.Any(r => !r.IsActive))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Một hoặc nhiều phòng không còn hoạt động");
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
                        null,
                        rooms.Select(r => new RoomQueryResult(r.Id, r.Name, r.Building.Name, r.Building.Area.Name, r.Building.Area.Id)),
                        [],
                        [],
                        [],
                        user.ReportCount
                    );
                    //notificationService.SendNotification("UserCreated", userResult, Constants.AdminHubGroup);
                    return ResponseModel.SuccessResponse(userResult);
            }
            return ResponseModel.SuccessResponse(user);
        }
    }
}
