using Microsoft.EntityFrameworkCore.Storage;

namespace ResiBuy.Server.Application.Commands.UserCommands
{
    public record UpdateUserRoleCommand(string Id, UpdateRolesDto Dto) : IRequest<ResponseModel>;
    public class UpdateUserRoleCommandHandler(
        IUserDbService userDbService, IShipperDbService shipperDbService, IStoreDbService storeDbService, IRoomDbService roomDbService, IAreaDbService areaDbService)
        : IRequestHandler<UpdateUserRoleCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateUserRoleCommand command, CancellationToken cancellationToken)
        {
            IDbContextTransaction? transaction = null;
            try
            {
                transaction = await userDbService.BeginTransactionAsync();

                var dto = command.Dto;

                if (string.IsNullOrEmpty(command.Id) || !dto.Roles.Any())
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không có gì để thêm vào");

                if (!dto.Roles.Any())
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể xóa hết vai trò");

                if (dto.Roles.Contains(Constants.AdminRole))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được thêm Admin");

                if (!dto.Roles.All(role => Constants.AllowedRoles.Contains(role)))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vai trò người dùng không hợp lệ");

                var existingUser = await userDbService.GetUserById(command.Id);
                if (existingUser == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng không tồn tại");

                if (existingUser.Roles.Contains(Constants.AdminRole))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tài khoản ADMIN không được thêm vai trò khác");

                if (dto.Roles.SequenceEqual(existingUser.Roles))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng đã sở hữu những vai trò này");
                var missingRoles = existingUser.Roles.Except(dto.Roles).ToList();
                if (missingRoles.Any()) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được xóa các role cũ: " + string.Join(", ", missingRoles));
                var nonExistingRoles = dto.Roles.Except(existingUser.Roles).ToList();
                if (nonExistingRoles.Any()) ResponseModel.SuccessResponse();
                if (nonExistingRoles.Contains(Constants.ShipperRole))
                {
                    if (dto.Shipper == null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng điền thông tin của người đăng kí giao hàng.");

                    if (dto.Shipper.LastLocationId == Guid.Empty)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Khu vực không hợp lệ.");

                    var area = await areaDbService.GetByIdAsync(dto.Shipper.LastLocationId)
                        ?? throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại.");

                    if (dto.Shipper.StartWorkTime is < 0 or > 24)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian bắt đầu làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");

                    if (dto.Shipper.EndWorkTime is < 0 or > 24)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thời gian kết thúc làm việc phải nằm trong khoảng từ 0 đến 24 giờ.");


                    var shipper = new Shipper
                    {
                        Id = Guid.Parse(existingUser.Id),
                        UserId = existingUser.Id,
                        IsOnline = false,
                        ReportCount = 0,
                        StartWorkTime = dto.Shipper.StartWorkTime,
                        EndWorkTime = dto.Shipper.EndWorkTime,
                        LastLocationId = dto.Shipper.LastLocationId
                    };

                    await shipperDbService.CreateTransactionAsync(shipper);
                }

                if (nonExistingRoles.Contains(Constants.SellerRole))
                {
                    if (dto.Store == null)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng điền thông tin cửa hàng.");

                    if (dto.Store.RoomId == Guid.Empty)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Phòng không hợp lệ.");

                    var room = await roomDbService.GetByIdAsync(dto.Store.RoomId)
                        ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy phòng");

                    if (existingUser.Roles.Contains(Constants.ShipperRole) &&
                        !existingUser.UserRooms.Any(ur => ur.RoomId == dto.Store.RoomId))
                    {
                        existingUser.UserRooms = existingUser.UserRooms.Append(new UserRoom(existingUser.Id, room.Id));
                    }

                    if (await storeDbService.CheckRoomIsAvailable(dto.Store.RoomId))
                        throw new CustomException(ExceptionErrorCode.DuplicateValue, "Phòng đã có người sử dụng");

                    if (string.IsNullOrWhiteSpace(dto.Store.Name))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần điền tên cửa hàng của bạn");
                    if (await storeDbService.CheckStoreIsAvailable(dto.Store.Name)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên cửa hàng đã tồn tại, thử lại 1 tên khác.");
                    var store = new Store
                    {
                        Name = dto.Store.Name,
                        Description = dto.Store.Description,
                        IsLocked = false,
                        IsOpen = true,
                        ReportCount = 0,
                        CreatedAt = DateTime.Now,
                        OwnerId = existingUser.Id,
                        RoomId = dto.Store.RoomId
                    };

                    existingUser.Stores = existingUser.Stores.Append(store).ToList();
                }

                if (nonExistingRoles.Contains(Constants.CustomerRole))
                {
                    if (existingUser.Roles.Contains(Constants.ShipperRole))
                    {
                        if (dto.Customer == null)
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, "Vui lòng điền thông tin người mua.");

                        var room = await roomDbService.GetByIdAsync(dto.Customer.RoomId)
                            ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy phòng");

                        if (!existingUser.UserRooms.Any(ur => ur.RoomId == dto.Customer.RoomId))
                        {
                            existingUser.UserRooms = existingUser.UserRooms.Append(new UserRoom(existingUser.Id, room.Id));
                        }
                    }
                }

                existingUser.Roles = dto.Roles;
                await userDbService.UpdateTransactionAsync(existingUser);
                await userDbService.SaveChangesAsync();
                await transaction.CommitAsync();

                return ResponseModel.SuccessResponse(existingUser);
            }
            catch (Exception)
            {
                if (transaction != null)
                    await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
