namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record UpdateUserRoleCommand(string Id, UpdateRolesDto Dto) : IRequest<ResponseModel>;
    public class UpdateUserRoleCommandHandler(
        IUserDbService userDbService, IShipperDbService shipperDbService, IStoreDbService storeDbService, IRoomDbService roomDbService) 
        : IRequestHandler<UpdateUserRoleCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateUserRoleCommand command, CancellationToken cancellationToken)
        {
            var dto = command.Dto;
            if (string.IsNullOrEmpty(command.Id) || !dto.Roles.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có gì để thêm vào");
            if (dto.Roles.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể xóa hết vai trò");
            if (dto.Roles.Contains("ADMIN")) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được thêm Admin");
            if (!dto.Roles.All(role => Constants.AllowedRoles.Contains(role)))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vai trò người dùng không hợp lệ");
            var existingUser = await userDbService.GetUserById(command.Id);
            if (existingUser == null) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");
            if(existingUser.Roles.Contains(Constants.AdminRole)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tài khoản ADMIN không được thêm vai trò khác");
            if (dto.Roles == existingUser.Roles) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng đã sở hữu những vai trò này");
            var nonExistingRoles = dto.Roles
                .Where(role => !existingUser.Roles.Contains(role))
                .ToList();
            if(nonExistingRoles.Contains(Constants.ShipperRole))
            {
                if (dto.RegisterShiperDto.LastLocationId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Khu vực không hợp lệ.");
                if (dto.RegisterShiperDto.StartWorkTime < 0 || dto.RegisterShiperDto.StartWorkTime > 24)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
                if (dto.RegisterShiperDto.EndWorkTime < 0 || dto.RegisterShiperDto.EndWorkTime > 24)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian kết thúc làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");
                var shipper = new Shipper
                {
                    Id = Guid.Parse(existingUser.Id),
                    UserId = existingUser.Id,
                    IsOnline = false,
                    ReportCount = 0,
                    StartWorkTime = dto.RegisterShiperDto.StartWorkTime,
                    EndWorkTime = dto.RegisterShiperDto.EndWorkTime,
                    LastLocationId = dto.RegisterShiperDto.LastLocationId
                };
                await shipperDbService.CreateAsync(shipper);
            }
            if (nonExistingRoles.Contains(Constants.SellerRole))
            {
                if (existingUser.Roles.Contains(Constants.ShipperRole))
                {
                    var room = await roomDbService.GetByIdAsync(dto.RegisterStoreDto.RoomId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy phòng");
                    if (!existingUser.UserRooms.Any(ur => ur.RoomId == dto.RegisterStoreDto.RoomId))
                        existingUser.UserRooms = existingUser.UserRooms.Append(new UserRoom(existingUser.Id, room.Id));
                }
                if (await storeDbService.CheckRoomIsAvailable(dto.RegisterStoreDto.RoomId))
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, "Phòng đã có người sử dụng");
                var store = new Store
                {
                    Name = dto.RegisterStoreDto.Name,
                    Description = dto.RegisterStoreDto.Description,
                    IsLocked = false,
                    IsOpen = true,
                    ReportCount = 0,
                    CreatedAt = DateTime.Now,
                    OwnerId = existingUser.Id,
                    RoomId = dto.RegisterStoreDto.RoomId
                };
                existingUser.Stores = existingUser.Stores.Append(store).ToList();
            }
            if (nonExistingRoles.Contains(Constants.CustomerRole))
            {
                if(existingUser.Roles.Contains(Constants.ShipperRole))
                {
                    var room = await roomDbService.GetByIdAsync(dto.RegisterStoreDto.RoomId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy phòng");
                    if (!existingUser.UserRooms.Any(ur => ur.RoomId == dto.RegisterStoreDto.RoomId))
                        existingUser.UserRooms = existingUser.UserRooms.Append(new UserRoom(existingUser.Id, room.Id));
                }

            }
            existingUser.Roles = dto.Roles;
            var updatedUser = await userDbService.UpdateAsync(existingUser);
            return ResponseModel.SuccessResponse(updatedUser);
        }
    }
}
 