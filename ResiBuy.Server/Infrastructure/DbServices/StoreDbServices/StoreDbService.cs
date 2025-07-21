namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public class StoreDbService : BaseDbService<Store>, IStoreDbService
    {
        private readonly ResiBuyContext _context;

        public StoreDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Store>> GetAllStoresAsync(int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Stores.AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(s => s.Id)
                    .Include(s => s.Room)
                    .ThenInclude(r => r.Building)
                    .ThenInclude(b => b.Area)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return new PagedResult<Store>
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

        public async Task<Store> GetStoreByIdAsync(Guid id)
        {
            try
            {
                var store = await _context.Stores.Include(s => s.Room)
                        .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area)
                    .FirstOrDefaultAsync(s => s.Id == id);
                return store;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<PagedResult<Store>> GetStoreByOwnerIdAsync(string ownerId, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                var query = _context.Stores
                    .Where(s => s.OwnerId == ownerId) 
                    .Include(s => s.Room)
                        .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area);

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(s => s.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Store>
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

        public async Task<bool> CheckRoomIsAvailable(Guid roomId)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.RoomId == roomId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStoreIsAvailable(string name)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.Name == name);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> CheckStorePhoneIsAvailable(string phone)
        {
            try
            {
                return await _context.Stores
                    .AnyAsync(s => s.PhoneNumber == phone);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountAllStoresAsync()
        {
            try
            {
                return await _context.Stores.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountStoresByIsOpenAsync(bool isOpen)
        {
            try
            {
                return await _context.Stores.CountAsync(s => s.IsOpen == isOpen);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountStoresByIsLockedAsync(bool isLocked)
        {
            try
            {
                return await _context.Stores.CountAsync(s => s.IsLocked == isLocked);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}