using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.AreaDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;
using ResiBuy.Server.Infrastructure.DbServices.UserDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Application.Commands.ShipperCommands
{
    public record CreateShipperCommand(
        string PhoneNumber,
        string Email,
        string Password,
        string IdentityNumber,
        DateTime DateOfBirth,
        string FullName,
        Guid LastLocationId
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
            // 1. Kiểm tra user đã tồn tại chưa
            var existingUser = await _userDbService.GetUserAsync(null, command.IdentityNumber, command.PhoneNumber, command.Email);
            if (existingUser != null)
                throw new CustomException(ExceptionErrorCode.DuplicateValue, "Người dùng đã tồn tại với thông tin tương tự (SĐT, Email hoặc CMND/CCCD).");

            // 2. Kiểm tra khu vực (Area) có tồn tại không
            var area = await _areaDbService.GetByIdBaseAsync(command.LastLocationId);
            if (area == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại.");
            }

            // 3. Tạo User với role SHIPPER
            var user = new User(
                command.PhoneNumber,
                command.Email,
                command.IdentityNumber,
                command.DateOfBirth,
                command.FullName,
                new List<string> { "SHIPPER" }
            );
            user.PasswordHash = CustomPasswordHasher.HashPassword(command.Password);

            var createdUser = await _userDbService.CreateAsync(user);

            // 4. Tạo Shipper
            var shipper = new Shipper
            {
                Id = Guid.Parse(user.Id),
                UserId = createdUser.Id,
                IsOnline = false,
                ReportCount = 0,
                StartWorkTime = DateTime.Now,
                EndWorkTime = DateTime.Now,
                LastLocationId = command.LastLocationId
            };

            await _shipperDbService.CreateAsync(shipper);

            return ResponseModel.SuccessResponse();
        }
    }
} 