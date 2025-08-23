using MediatR;
using Pipelines.Sockets.Unofficial.Arenas;
using ResiBuy.Server.Application.Commands.ImportCommands.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices;
using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;
using ResiBuy.Server.Infrastructure.Model;

using ResiBuy.Server.Services.RedisServices;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
namespace ResiBuy.Server.Application.Commands.ImportCommands
{
    public record ConfirmImportCommand(List<ImportAreaBuildingRoomDto> NewEntities) : IRequest<ResponseModel>;

    public class ConfirmImportCommandHandler : IRequestHandler<ConfirmImportCommand, ResponseModel>
    {
        private readonly IAreaDbService _areaDbService;
        private readonly IBuildingDbService _buildingDbService;
        private readonly IRoomDbService _roomDbService;
        private readonly ILogger<ConfirmImportCommandHandler> _logger;

        public ConfirmImportCommandHandler( IAreaDbService areaDbService, IBuildingDbService buildingDbService,IRoomDbService roomDbService,ILogger<ConfirmImportCommandHandler> logger){ _areaDbService = areaDbService;_buildingDbService = buildingDbService;_roomDbService = roomDbService; _logger = logger;
        }

        public async Task<ResponseModel> Handle(ConfirmImportCommand request, CancellationToken cancellationToken)
        {
            if (request.NewEntities == null || !request.NewEntities.Any())
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Không có dữ liệu để xử lý");

            try
            {
                var existingAreas = await _areaDbService.GetAllAreaAsync(false);
                var areaDict = new Dictionary<string, Area>(StringComparer.Ordinal);
                foreach (var area in existingAreas)
                {
                    if (!areaDict.ContainsKey(area.Name))
                    {
                        areaDict[area.Name] = area;
                    }
                    else
                    {
                        _logger.LogWarning("Phát hiện tên khu vực trùng lặp trong cơ sở dữ liệu: {AreaName}. Sử dụng khu vực đầu tiên.", area.Name);
                    }
                }
                var groupedEntities = request.NewEntities
                    .GroupBy(e => (AreaName: e.AreaName, BuildingName: e.BuildingName), new AreaBuildingComparer())
                    .Select(g => new
                    {
                        AreaName = g.Key.AreaName,
                        BuildingName = g.Key.BuildingName,
                        Latitude = g.First().Latitude,
                        Longitude = g.First().Longitude,
                        RoomNames = g.SelectMany(e => e.RoomNames).Distinct(StringComparer.Ordinal).ToList()
                    })
                    .ToList();
                var areasToCreate = new List<Area>();
                var buildingsToCreate = new List<(string Name, string AreaName, Guid TempId)>();
                var roomsToCreate = new List<(Guid BuildingId, string RoomName, string BuildingName, string AreaName)>();

                foreach (var data in groupedEntities)
                {
                    if (string.IsNullOrWhiteSpace(data.AreaName) || string.IsNullOrWhiteSpace(data.BuildingName) || !data.RoomNames.Any())
                    {
                        _logger.LogWarning("Bỏ qua dữ liệu không hợp lệ: AreaName={AreaName}, BuildingName={BuildingName}, RoomNames={RoomNames}",
                            data.AreaName, data.BuildingName, string.Join(",", data.RoomNames));
                        continue;
                    }

                    if (data.Latitude < -90 || data.Latitude > 90 || data.Longitude < -180 || data.Longitude > 180)
                    {
                        _logger.LogWarning("Bỏ qua tọa độ không hợp lệ: Latitude={Latitude}, Longitude={Longitude}", data.Latitude, data.Longitude);
                        continue;
                    }
                    if (!areaDict.TryGetValue(data.AreaName, out var existingArea))
                    {
                        if (await _areaDbService.IsNameExistsAsync(data.AreaName))
                        {
                            _logger.LogWarning("Khu vực {AreaName} đã tồn tại trong cơ sở dữ liệu nhưng không có trong areaDict. Bỏ qua.", data.AreaName);
                            continue;
                        }
                        existingArea = new Area(data.AreaName, data.Latitude, data.Longitude);
                        areasToCreate.Add(existingArea);
                        areaDict[data.AreaName] = existingArea;
                    }
                    var tempBuildingId = Guid.NewGuid();
                    buildingsToCreate.Add((data.BuildingName, data.AreaName, tempBuildingId));
                    foreach (var roomName in data.RoomNames)
                    {
                        roomsToCreate.Add((tempBuildingId, roomName, data.BuildingName, data.AreaName));
                    }
                }
                using var transaction = await _areaDbService.BeginTransactionAsync();
                try
                {
                    var buildingDict = new Dictionary<(string Name, Guid AreaId), Guid>(new BuildingKeyComparer());
                    if (areasToCreate.Any())
                    {
                        var createdAreas = await _areaDbService.AddRangeAsync(areasToCreate);
                        await _areaDbService.SaveChangesAsync();
                        foreach (var area in createdAreas)
                        {
                            if (area.Id == Guid.Empty)
                            {
                                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không thể tạo khu vực: {area.Name}");
                            }
                            areaDict[area.Name].Id = area.Id;
                            _logger.LogInformation("Tạo khu vực mới: {AreaName} với Id: {AreaId}", area.Name, area.Id);
                        }
                    }
                    if (buildingsToCreate.Any())
                    {
                        var buildingsToAdd = new List<Building>();
                        foreach (var (name, areaName, tempId) in buildingsToCreate)
                        {
                            if (!areaDict.TryGetValue(areaName, out var area))
                            {
                                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không tìm thấy khu vực: {areaName}");
                            }
                            if (area.Id == Guid.Empty)
                            {
                                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Khu vực {areaName} chưa có Id hợp lệ");
                            }
                            if (!await _buildingDbService.IsNameExistsAsync(name, area.Id))
                            {
                                buildingsToAdd.Add(new Building { Name = name, AreaId = area.Id, IsActive = true });
                            }
                            else
                            {
                                var existingBuilding = await _buildingDbService.GetBuildingByNameAndAreaIdAssync(name, area.Id);
                                buildingDict[(name, area.Id)] = existingBuilding.Id;
                                _logger.LogInformation("Tòa nhà {BuildingName} đã tồn tại trong khu vực {AreaName} với Id: {BuildingId}", name, areaName, existingBuilding.Id);
                            }
                        }

                        if (buildingsToAdd.Any())
                        {
                            var createdBuildings = await _buildingDbService.AddRangeAsync(buildingsToAdd);
                            await _buildingDbService.SaveChangesAsync();
                            int index = 0;
                            foreach (var building in createdBuildings)
                            {
                                if (building.Id == Guid.Empty)
                                {
                                    throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không thể tạo tòa nhà: {building.Name} trong khu vực: {building.AreaId}");
                                }
                                var original = buildingsToCreate[index];
                                buildingDict[(building.Name, building.AreaId)] = building.Id;
                                _logger.LogInformation("Tạo tòa nhà mới: {BuildingName} trong khu vực: {AreaId}", building.Name, building.AreaId);
                                index++;
                            }
                        }
                    }
                    if (roomsToCreate.Any())
                    {
                        var roomsToAdd = new List<Room>();
                        foreach (var (tempBuildingId, roomName, buildingName, areaName) in roomsToCreate)
                        {
                            if (!areaDict.TryGetValue(areaName, out var area))
                            {
                                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không tìm thấy khu vực: {areaName} cho phòng: {roomName}");
                            }
                            if (!buildingDict.TryGetValue((buildingName, area.Id), out var buildingId))
                            {
                                var existingBuilding = await _buildingDbService.GetBuildingByNameAndAreaIdAssync(buildingName, area.Id);
                                if (existingBuilding == null)
                                {
                                    throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không tìm thấy tòa nhà: {buildingName} trong khu vực: {areaName}");
                                }
                                buildingId = existingBuilding.Id;
                                buildingDict[(buildingName, area.Id)] = buildingId;
                            }
                            if (!await _roomDbService.IsNameExistsAsync(buildingId, roomName))
                            {
                                roomsToAdd.Add(new Room(roomName, buildingId));
                            }
                            else
                            {
                                _logger.LogInformation("Phòng {RoomName} đã tồn tại trong tòa nhà {BuildingId}", roomName, buildingId);
                            }
                        }

                        if (roomsToAdd.Any())
                        {
                            var createdRooms = await _roomDbService.AddRangeAsync(roomsToAdd);
                            await _roomDbService.SaveChangesAsync();
                            foreach (var room in createdRooms)
                            {
                                if (room == null)
                                {
                                    throw new CustomException(ExceptionErrorCode.RepositoryError, $"Không thể tạo phòng: {room.Name} trong tòa nhà: {room.BuildingId}");
                                }
                                _logger.LogInformation("Tạo phòng mới: {RoomName} trong tòa nhà: {BuildingId}", room.Name, room.BuildingId);
                            }
                        }
                    }

                    await transaction.CommitAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    _logger.LogError(ex, "Lỗi trong giao dịch khi xác nhận import");
                    throw new CustomException(ExceptionErrorCode.RepositoryError, $"Lỗi khi lưu dữ liệu: {ex.Message}");
                }

                return ResponseModel.SuccessResponse("Xác nhận import thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý xác nhận import");
                throw new CustomException(ExceptionErrorCode.RepositoryError, $"Lỗi khi xử lý import: {ex.Message}");
            }
        }
    }

    public class AreaBuildingComparer : IEqualityComparer<(string AreaName, string BuildingName)>
    {
        public bool Equals((string AreaName, string BuildingName) x, (string AreaName, string BuildingName) y)
        {
            return x.AreaName.Equals(y.AreaName, StringComparison.Ordinal) &&
                   x.BuildingName.Equals(y.BuildingName, StringComparison.Ordinal);
        }

        public int GetHashCode((string AreaName, string BuildingName) obj)
        {
            return (obj.AreaName + obj.BuildingName).GetHashCode();
        }
    }

    public class BuildingKeyComparer : IEqualityComparer<(string Name, Guid AreaId)>
    {
        public bool Equals((string Name, Guid AreaId) x, (string Name, Guid AreaId) y)
        {
            return x.Name.Equals(y.Name, StringComparison.Ordinal) && x.AreaId == y.AreaId;
        }

        public int GetHashCode((string Name, Guid AreaId) obj)
        {
            return (obj.Name + obj.AreaId.ToString()).GetHashCode();
        }
    }
}