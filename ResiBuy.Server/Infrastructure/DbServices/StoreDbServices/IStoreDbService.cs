using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public interface IStoreDbService : IBaseDbService<Store>
    {
        Task<IEnumerable<Store>> GetAllStoresAsync();
        Task<Store> GetStoreByIdAsync(Guid id);
        Task<Store> GetStoreByOwnerIdAsync(string ownerId);
        Task<Store> UpdateStoreStatusAsync(Guid storeId, bool isLocked, bool isOpen);
    }
} 