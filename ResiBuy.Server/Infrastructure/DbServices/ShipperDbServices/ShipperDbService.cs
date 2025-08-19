using DocumentFormat.OpenXml.Office2021.Excel.RichDataWebImage;
using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Application.Queries.ShipperQueries.DTOs;
using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Services.MapBoxService;
using ResiBuy.Server.Services.OpenRouteService;
using ResiBuy.Server.Services.ShippingCost;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public class ShipperDbService : BaseDbService<Shipper>, IShipperDbService
    {
        private readonly ResiBuyContext _context;
        private readonly MapBoxService _mapBoxService;

        public ShipperDbService(ResiBuyContext context, MapBoxService mapBoxService) : base(context)
        {
            _context = context;
            _mapBoxService = mapBoxService;
        }

        public async Task<PagedResult<Shipper>> GetAllShippersAsync(int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Shippers.AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(s => s.Id)
                    .Include(s => s.User)
                    .Include(s => s.LastLocation)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return new PagedResult<Shipper>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                }; ;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<DirectionsResponse> GetDistanceAsync(Guid curentAreaId, Guid destinationAreaId)
        {
            try
            {
                var currentArea = _context.Areas.Find(curentAreaId);
                var destinationArea = _context.Areas.Find(destinationAreaId);
                if (currentArea == null || destinationArea == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại");
                // Giả sử bạn có một phương thức tính khoảng cách giữa hai khu vực
                return await _mapBoxService.GetDirectionsAsync(currentArea.Longitude, currentArea.Latitude, destinationArea.Longitude, destinationArea.Latitude);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Shipper> GetShipperByIdAsync(Guid id)
        {
            try
            {
                var shipper = await _context.Shippers
                    .Include(s => s.User)
                    .Include(s => s.LastLocation)
                    .FirstOrDefaultAsync(s => s.Id == id);
                return shipper;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Shipper> GetShipperByUserIdAsync(string userId)
        {
            try
            {
                var shipper = await _context.Shippers
                    .Include(s => s.User)
                    .Include(s => s.LastLocation)
                    .FirstOrDefaultAsync(s => s.UserId == userId);
                return shipper;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public Task<List<Shipper>> GetShippersInAreaAsync(Guid areaId)
        {
            try
            {
                var shippers = _context.Shippers.Where(s => s.LastLocationId == areaId).ToListAsync();
                return shippers;
            }
            catch
            (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Shipper> UpdateShipperLocationAsync(Guid shipperId, Guid locationId)
        {
            try
            {
                var shipper = await _context.Shippers.FindAsync(shipperId);
                if (shipper == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");

                shipper.LastLocationId = locationId;
                await _context.SaveChangesAsync();
                return shipper;
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed, ex.Message);
            }
        }

        public async Task<Shipper> UpdateShipperStatusAsync(Guid shipperId, bool isOnline, Guid AreaId)
        {
            try
            {
                var shipper = await _context.Shippers.FindAsync(shipperId);
                if (shipper == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");

                if (isOnline)
                {
                    var nowHour = (float)DateTime.Now.TimeOfDay.TotalHours;

                    bool isInShift;
                    if (shipper.StartWorkTime < shipper.EndWorkTime)
                    {
                        isInShift = nowHour >= shipper.StartWorkTime && nowHour <= shipper.EndWorkTime;
                    }
                    else
                    {
                        isInShift = nowHour >= shipper.StartWorkTime || nowHour <= shipper.EndWorkTime;
                    }
                    await UpdateShipperLocationAsync(shipperId, AreaId);

                    if (!isInShift)
                        throw new CustomException(ExceptionErrorCode.UpdateFailed, "Ngoài giờ làm việc, không thể bật online");
                }


                shipper.IsOnline = isOnline;
                if (shipper.FirstTimeLogin == null)
                {
                    shipper.FirstTimeLogin = DateTime.Now;
                }
                await _context.SaveChangesAsync();
                return shipper;
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task CheckInShipperAsync(Guid shipperId, bool isOnline)
        {
            try
            {
                var shipper = await _context.Shippers.FindAsync(shipperId);
                if (shipper == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");

                var isLate = false;
                if (isOnline)
                {
                    var nowTime = (float)DateTime.Now.TimeOfDay.TotalHours;
                    if (nowTime > shipper.StartWorkTime + 0.25f)
                        isLate = true;
                }

                var timeSheet = new TimeSheet(shipperId, DateTime.Now, isLate);
                await _context.TimeSheets.AddAsync(timeSheet);

                await _context.SaveChangesAsync();
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        public async Task<int> CountShippersByOnlineStatusAsync(bool isOnline)
        {
            try
            {
                return await _context.Shippers.CountAsync(s => s.IsOnline == isOnline);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountShippersByShippingStatusAsync(bool isShipping)
        {
            try
            {
                return await _context.Shippers.CountAsync(s => s.IsShipping == isShipping);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<PagedResult<Shipper>> SearchShippersAsync(string keyword, bool? isOnline, bool? isLocked, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Shippers
                    .Include(s => s.User)
                    .Include(s => s.LastLocation)
                    .AsQueryable();
                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    keyword = keyword.Trim().ToLower();
                    query = query.Where(s =>
                        (s.User.FullName != null && s.User.FullName.ToLower().Contains(keyword)) ||
                        (s.User.PhoneNumber != null && s.User.PhoneNumber.ToLower().Contains(keyword)) ||
                        (s.User.Email != null && s.User.Email.ToLower().Contains(keyword))
                    );
                }

                if (isOnline.HasValue)
                {
                    query = query.Where(s => s.IsOnline == isOnline.Value);
                }
                if (isLocked.HasValue)
                {
                    query = query.Where(s => s.IsLocked == isLocked.Value);
                }

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(s => s.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Shipper>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        public async Task<int> CountAllShipper()
        {
            try
            {
                return await _context.Shippers.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> SumShipperReportCountAsync()
        {
            try
            {
                return await _context.Shippers.SumAsync(s => s.ReportCount);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> SumShipperLockedAsync()
        {
            try
            {
                return await _context.Shippers.CountAsync(s => s.IsLocked);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        public async Task<TimeSheetSummaryDto> GetTimeSheetSummaryAsync(Guid shipperId, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.TimeSheets
                .Where(ts => ts.ShipperId == shipperId)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(ts => ts.DateMark >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(ts => ts.DateMark <= endDate.Value);

            var data = await query.ToListAsync();

            return new TimeSheetSummaryDto
            {
                CountAll = data.Count,
                CountLate = data.Count(ts => ts.IsLate),
                CountOnTime = data.Count(ts => !ts.IsLate),
                Data = data
            };
        }
    }
}