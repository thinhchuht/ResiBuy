using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public interface IStoreDbService : IBaseDbService<Store>
    {
        Task<PagedResult<Store>> GetAllStoresAsync(int pageNumber = 1, int pageSize = 5);
        Task<Store> GetStoreByIdAsync(Guid id);
        Task<IEnumerable<Store>> GetStoreByOwnerIdAsync(string ownerId, int pageNumber = 1, int pageSize = 5);
        Task<Store> UpdateStoreStatusAsync(Guid storeId, bool isLocked, bool isOpen);
        Task<bool> CheckRoomIsAvailable(Guid roomId);
    }
}