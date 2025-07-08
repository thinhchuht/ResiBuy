namespace ResiBuy.Server.Infrastructure.DbServices.StoreDbServices
{
    public interface IStoreDbService : IBaseDbService<Store>
    {
        Task<PagedResult<Store>> GetAllStoresAsync(int pageNumber = 1, int pageSize = 5);
        Task<Store> GetStoreByIdAsync(Guid id);
        Task<PagedResult<Store>> GetStoreByOwnerIdAsync(string ownerId, int pageNumber = 1, int pageSize = 5);
        Task<Store> UpdateStoreStatusAsync(Guid storeId, bool isLocked, bool isOpen);
        Task<bool> CheckRoomIsAvailable(Guid roomId);
        Task<bool> CheckStoreIsAvailable(string name);
        Task<int> CountAllStoresAsync();
        Task<int> CountStoresByIsOpenAsync(bool isOpen);
        Task<int> CountStoresByIsLockedAsync(bool isLocked);
    }
}