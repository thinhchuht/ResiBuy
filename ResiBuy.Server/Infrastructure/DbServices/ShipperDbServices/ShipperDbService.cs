using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Services.OpenRouteService;
using ResiBuy.Server.Services.ShippingCost;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public class ShipperDbService : BaseDbService<Shipper>, IShipperDbService
    {
        private readonly ResiBuyContext _context;
        private readonly OpenRouteService _openRouteService;

        public ShipperDbService(ResiBuyContext context, OpenRouteService openRouteService) : base(context)
        {
            _context = context;
            _openRouteService = openRouteService;
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

        public async Task<ORSRouteResponse> GetDistanceAsync(Guid curentAreaId, Guid destinationAreaId)
        {
            try
            {
                var currentArea = _context.Areas.Find(curentAreaId);
                var destinationArea = _context.Areas.Find(destinationAreaId);
                if (currentArea == null || destinationArea == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại");
                // Giả sử bạn có một phương thức tính khoảng cách giữa hai khu vực
                return await _openRouteService.GetRouteAsync(currentArea.Longitude,currentArea.Latitude,destinationArea.Longitude,destinationArea.Latitude);
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

        public async Task<Shipper> UpdateShipperStatusAsync(Guid shipperId, bool isOnline)
        {
            try
            {
                var shipper = await _context.Shippers.FindAsync(shipperId);
                if (shipper == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Shipper không tồn tại");

                shipper.IsOnline = isOnline;
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


    }
}