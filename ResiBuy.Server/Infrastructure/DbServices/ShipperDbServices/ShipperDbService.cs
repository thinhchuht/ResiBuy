using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public class ShipperDbService : BaseDbService<Shipper>, IShipperDbService
    {
        private readonly ResiBuyContext _context;

        public ShipperDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Shipper>> GetAllShippersAsync()
        {
            try
            {
                var shippers = await _context.Shippers
                    .Include(s => s.User)
                    .Include(s => s.LastLocation)
                    .ToListAsync();
                return shippers;
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