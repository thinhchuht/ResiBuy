namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record CreateShipperCommand(
        string PhoneNumber,
        string Email,
        string Password,
        string IdentityNumber,
        DateTime DateOfBirth,
        string FullName,
        Guid LastLocationId,
        float StartWorkTime, 
        float EndWorkTime    
    ) : IRequest<ResponseModel>;

    public class CreateShipperCommandHandler : IRequestHandler<CreateShipperCommand, ResponseModel>
    {
        private readonly IUserDbService _userDbService;
        private readonly IShipperDbService _shipperDbService;
        private readonly IAreaDbService _areaDbService;

        public CreateShipperCommandHandler(IUserDbService userDbService, IShipperDbService shipperDbService, IAreaDbService areaDbService)
        {
            _userDbService = userDbService;
            _shipperDbService = shipperDbService;
            _areaDbService = areaDbService;
        }

        public async Task<ResponseModel> Handle(CreateShipperCommand command, CancellationToken cancellationToken)
        {

            if (!command.IdentityNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số CCCD");
            if (!command.PhoneNumber.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tạo người dùng mà không có số điện thoại");
            if (!Regex.IsMatch(command.PhoneNumber, Constants.PhoneNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số điện thoại không hợp lệ");
            if (!string.IsNullOrEmpty(command.Email) && !Regex.IsMatch(command.Email, Constants.EmailPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Email không hợp lệ");
            if (!Regex.IsMatch(command.IdentityNumber, Constants.IndentityNumberPattern)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số CCCD/CMND không hợp lệ");
            await _userDbService.CheckUniqueField(phoneNumber: command.PhoneNumber,email: command.Email,identityNumber: command.IdentityNumber);
            if (command.DateOfBirth > DateTime.Now)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ngày sinh phải trước ngày hiện tại.");
            if (command.LastLocationId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Khu vực không hợp lệ.");
            if (command.StartWorkTime < 0 || command.StartWorkTime > 24)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
            if (command.EndWorkTime < 0 || command.EndWorkTime > 24)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian kết thúc làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
            // 2. Kiểm tra user đã tồn tại chưa
            var existingUser = await _userDbService.GetUserAsync(null, command.IdentityNumber, command.PhoneNumber, command.Email);
            if (existingUser != null)
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Người dùng đã tồn tại với thông tin tương tự (SĐT, Email hoặc CMND/CCCD).");
            // 3. Kiểm tra khu vực (Area) có tồn tại không
            var area = await _areaDbService.GetByIdBaseAsync(command.LastLocationId);
            if (area == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại.");
            }
            // 4. Tạo User với role SHIPPER
            var user = new User(
                command.PhoneNumber,
                command.Email,
                command.IdentityNumber,
                command.DateOfBirth,
                command.FullName,
                new List<string> { Constants.ShipperRole }
            );
            user.PasswordHash = CustomPasswordHasher.HashPassword(string.IsNullOrEmpty(command.Password) ? Constants.DefaulAccountPassword: command.Password);

            var createdUser = await _userDbService.CreateAsync(user);
            // 5. Tạo Shipper
            var shipper = new Shipper
            {
                Id = Guid.Parse(user.Id),
                UserId = createdUser.Id,
                IsOnline = false,
                ReportCount = 0,
                StartWorkTime = command.StartWorkTime,
                EndWorkTime = command.EndWorkTime,
                LastLocationId = command.LastLocationId
            };

            await _shipperDbService.CreateAsync(shipper);

            return ResponseModel.SuccessResponse();
        }
    }
}
