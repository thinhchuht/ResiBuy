using ClosedXML.Excel;
using ResiBuy.Server.Application.Commands.ImportCommands.DTOs;
public record ImportAreaBuildingRoomExcelCommand(IFormFile File) : IRequest<ResponseModel>;

public class ImportAreaBuildingRoomExcelCommandHandler : IRequestHandler<ImportAreaBuildingRoomExcelCommand, ResponseModel>
{
    private readonly IAreaDbService _areaDbService;
    private readonly IBuildingDbService _buildingDbService;
    private readonly IRoomDbService _roomDbService;
    private readonly ILogger<ImportAreaBuildingRoomExcelCommandHandler> _logger;
    private readonly string[] ExpectedHeaders = { "Tên khu vực", "Vĩ độ", "Kinh độ", "Tên tòa nhà", "Tên phòng" };

    public ImportAreaBuildingRoomExcelCommandHandler(
        IAreaDbService areaDbService,
        IBuildingDbService buildingDbService,
        IRoomDbService roomDbService,
        ILogger<ImportAreaBuildingRoomExcelCommandHandler> logger)
    {
        _areaDbService = areaDbService;
        _buildingDbService = buildingDbService;
        _roomDbService = roomDbService;
        _logger = logger;
    }

    public async Task<ResponseModel> Handle(ImportAreaBuildingRoomExcelCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Đang xử lý import file Excel");

        if (request.File == null || request.File.Length == 0)
            throw new CustomException(ExceptionErrorCode.NotFound, "Vui lòng chọn file Excel để tải lên");

        var fileExtension = Path.GetExtension(request.File.FileName).ToLower();
        if (fileExtension != ".xlsx" && fileExtension != ".xls"&& fileExtension != ".csv")
            throw new CustomException(ExceptionErrorCode.InvalidInput, "Chỉ chấp nhận file Excel (.xlsx, .xls)");

        var messages = new List<string>();
        var existingEntities = new List<string>();
        var newEntities = new List<string>();
        var importDataList = new List<ImportAreaBuildingRoomDto>();
        var processedAreas = new HashSet<string>();
        var processedBuildings = new HashSet<string>();
        var processedRooms = new HashSet<string>();

        using var stream = new MemoryStream();
        await request.File.CopyToAsync(stream, cancellationToken);
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var firstRow = worksheet.FirstRowUsed();

        if (firstRow == null)
            throw new CustomException(ExceptionErrorCode.InvalidInput, "File Excel không có dữ liệu");

        var headers = firstRow.Cells().Select(c => c.GetValue<string>()?.Trim()).ToArray();
        if (headers.Length < ExpectedHeaders.Length)
            throw new CustomException(ExceptionErrorCode.InvalidInput, "Số lượng cột không đúng");

        for (int i = 0; i < ExpectedHeaders.Length; i++)
        {
            if (!string.Equals(headers[i], ExpectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                throw new CustomException(ExceptionErrorCode.InvalidInput, $"Cột thứ {i + 1} phải là '{ExpectedHeaders[i]}'");
        }

        var rows = worksheet.RowsUsed().Skip(1).ToList();
        foreach (var row in rows)
        {
            var areaName = row.Cell(1).GetValue<string>()?.Trim();
            var latitudeStr = row.Cell(2).GetValue<string>()?.Trim();
            var longitudeStr = row.Cell(3).GetValue<string>()?.Trim();
            var buildingName = row.Cell(4).GetValue<string>()?.Trim();
            var roomName = row.Cell(5).GetValue<string>()?.Trim();

            if (string.IsNullOrWhiteSpace(areaName) || string.IsNullOrWhiteSpace(buildingName) || string.IsNullOrWhiteSpace(roomName))
            {
                _logger.LogWarning("Bỏ qua dòng không hợp lệ: AreaName={AreaName}, BuildingName={BuildingName}, RoomName={RoomName}", areaName, buildingName, roomName);
                messages.Add($"Lỗi: Dữ liệu không hợp lệ tại dòng {row.RowNumber()} (Area, Building hoặc Room trống)");
                continue;
            }
            if (string.IsNullOrWhiteSpace(latitudeStr) && string.IsNullOrWhiteSpace(longitudeStr))
            {
                var existingArea = await _areaDbService.GetAllAreaAsync(false)
                    .ContinueWith(t => t.Result.FirstOrDefault(a => a.Name.ToLower() == areaName.ToLower()));
                if (existingArea == null)
                {
                    _logger.LogWarning("Bỏ qua dòng {RowNumber}: AreaName={AreaName} không tồn tại", row.RowNumber(), areaName);
                    messages.Add($"Lỗi: Tên khu vực không tồn tại tại dòng {row.RowNumber()} (AreaName={areaName})");
                    continue;
                }
                latitudeStr = existingArea.Latitude.ToString();
                longitudeStr = existingArea.Longitude.ToString();
            }
            if (!Regex.IsMatch(latitudeStr ?? "", @"^-?\d*\.?\d+$") || !Regex.IsMatch(longitudeStr ?? "", @"^-?\d*\.?\d+$"))
            {
                _logger.LogWarning("Bỏ qua định dạng không hợp lệ tại dòng {RowNumber}: Latitude={Latitude}, Longitude={Longitude}", row.RowNumber(), latitudeStr, longitudeStr);
                messages.Add($"Lỗi: Định dạng tọa độ không hợp lệ tại dòng {row.RowNumber()} (Latitude={latitudeStr}, Longitude={longitudeStr})");
                continue;
            }

            if (!double.TryParse(latitudeStr, out var latitude) || !double.TryParse(longitudeStr, out var longitude))
            {
                _logger.LogWarning("Bỏ qua định dạng số không hợp lệ tại dòng {RowNumber}: Latitude={Latitude}, Longitude={Longitude}", row.RowNumber(), latitudeStr, longitudeStr);
                messages.Add($"Lỗi: Tọa độ không phải số hợp lệ tại dòng {row.RowNumber()} (Latitude={latitudeStr}, Longitude={longitudeStr})");
                continue;
            }

            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
            {
                _logger.LogWarning("Bỏ qua tọa độ ngoài phạm vi tại dòng {RowNumber}: Latitude={Latitude}, Longitude={Longitude}", row.RowNumber(), latitude, longitude);
                messages.Add($"Lỗi: Tọa độ ngoài phạm vi tại dòng {row.RowNumber()} (Latitude={latitudeStr}, Longitude={longitudeStr})");
                continue;
            }

            var data = new ImportAreaBuildingRoomDto
            {
                AreaName = areaName,
                Latitude = latitude,
                Longitude = longitude,
                BuildingName = buildingName,
                RoomNames = new List<string> { roomName }
            };

            try
            {
                var areaKey = $"Area_{data.AreaName}";
                if (!processedAreas.Contains(areaKey))
                {
                    var existingArea = await _areaDbService.GetAllAreaAsync(false)
                        .ContinueWith(t => t.Result.FirstOrDefault(a => a.Name.ToLower() == data.AreaName.ToLower()));

                    if (existingArea != null)
                    {
                        messages.Add($"Khu vực {data.AreaName} đã tồn tại");
                        existingEntities.Add($"Khu vực: {data.AreaName}");
                    }
                    else
                    {
                        messages.Add($"Sẽ tạo khu vực mới {data.AreaName}");
                        newEntities.Add($"Khu vực: {data.AreaName} (Latitude={data.Latitude}, Longitude={data.Longitude})");
                    }
                    processedAreas.Add(areaKey);
                }

                var buildingKey = $"Building_{data.BuildingName}_In_{data.AreaName}";
                if (!processedBuildings.Contains(buildingKey))
                {
                    var existingArea = await _areaDbService.GetAllAreaAsync(false)
                        .ContinueWith(t => t.Result.FirstOrDefault(a => a.Name.ToLower() == data.AreaName.ToLower()));
                    var areaId = existingArea?.Id ?? Guid.NewGuid();

                    var existingBuilding = await _buildingDbService.GetBuildingByNameAndAreaIdAssync(data.BuildingName, areaId);
                    if (existingBuilding != null)
                    {
                        messages.Add($"Tòa nhà {data.BuildingName} đã tồn tại trong {data.AreaName}");
                        existingEntities.Add($"Tòa nhà: {data.BuildingName} trong Khu vực {data.AreaName}");
                    }
                    else
                    {
                        messages.Add($"Sẽ tạo tòa nhà mới {data.BuildingName} trong {data.AreaName}");
                        newEntities.Add($"Tòa nhà: {data.BuildingName} trong Khu vực {data.AreaName}");
                    }
                    processedBuildings.Add(buildingKey);
                }

                foreach (var room in data.RoomNames)
                {
                    var roomKey = $"Room_{room}_In_{data.AreaName}_{data.BuildingName}";
                    if (!processedRooms.Contains(roomKey))
                    {
                        var existingArea = await _areaDbService.GetAllAreaAsync(false)
                            .ContinueWith(t => t.Result.FirstOrDefault(a => a.Name.ToLower() == data.AreaName.ToLower()));
                        var areaId = existingArea?.Id ?? Guid.NewGuid();
                        var existingBuilding = await _buildingDbService.GetBuildingByNameAndAreaIdAssync(data.BuildingName, areaId);
                        var buildingId = existingBuilding?.Id ?? Guid.NewGuid();

                        var existingRoom = await _roomDbService.GetByRoomNameAndBuildingIdAsync(buildingId, room);
                        if (existingRoom != null)
                        {
                            messages.Add($"Phòng {room} đã tồn tại trong {data.AreaName} - {data.BuildingName}");
                            existingEntities.Add($"Phòng: {room} trong {data.AreaName} - {data.BuildingName}");
                        }
                        else
                        {
                            messages.Add($"Sẽ tạo phòng mới {room} trong {data.AreaName} - {data.BuildingName}");
                            newEntities.Add($"Phòng: {room} trong {data.AreaName} - {data.BuildingName}");
                        }
                        processedRooms.Add(roomKey);
                    }
                }

                importDataList.Add(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý dòng {RowNumber}: AreaName={AreaName}, BuildingName={BuildingName}", row.RowNumber(), data.AreaName, data.BuildingName);
                messages.Add($"Lỗi khi xử lý dòng {row.RowNumber()}: {ex.Message}");
            }
        }

        if (importDataList.Any())
        {
            var confirmationMessage = string.Join(". ", messages.Where(m => !string.IsNullOrEmpty(m)));
            if (newEntities.Any())
            {
                confirmationMessage += $". Nếu tiếp tục, sẽ thêm các thực thể sau: {string.Join("; ", newEntities)}";
            }
            else
            {
                confirmationMessage += ". Không có thực thể mới nào sẽ được thêm";
            }
            confirmationMessage += ". Bạn muốn tiếp tục thêm các thực thể còn lại?";

            return ResponseModel.SuccessResponse(new
            {
                ExistingEntities = existingEntities,
                NewEntities = newEntities,
                Data = importDataList,
                Errors = messages.Where(m => m.StartsWith("Lỗi:")).ToList(),
                ConfirmationMessage = confirmationMessage
            });
        }

        return ResponseModel.FailureResponse("Không có dữ liệu hợp lệ để xử lý");
    }
}
