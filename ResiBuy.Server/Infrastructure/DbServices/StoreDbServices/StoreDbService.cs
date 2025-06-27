using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Exceptions;
using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;

namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public class StoreDbService : BaseDbService<Store>, IStoreDbService
    {
        private readonly ResiBuyContext _context;

        public StoreDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Store>> GetAllStoresAsync(int pageNumber = 1,int pageSize = 5)
        {
            try
            {
                var stores = await _context.Stores
                    .Include(s => s.Owner)
                    .Include(s => s.Room)
                    .Skip((pageNumber-1)*pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return stores;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Store> GetStoreByIdAsync(Guid id)
        {
            try
            {
                var store = await _context.Stores
                    .Include(s => s.Owner)
                    .Include(s => s.Room)
                    .FirstOrDefaultAsync(s => s.Id == id);
                return store;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<Store>> GetStoreByOwnerIdAsync(string ownerId, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var store = await _context.Stores
                    .Include(s => s.Owner)
                    .Include(s => s.Room)
                    .Where(s => s.OwnerId == ownerId)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return store;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Store> UpdateStoreStatusAsync(Guid storeId, bool isLocked, bool isOpen)
        {
            try
            {
                var store = await _context.Stores.FindAsync(storeId);
                if (store == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, "Cửa hàng không tồn tại");

                store.IsLocked = isLocked;
                store.IsOpen = isOpen;
                await _context.SaveChangesAsync();
                return store;
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