using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.DTOs.StoreDtos;

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
        Task<bool> CheckStorePhoneIsAvailable(string phone);
        Task<int> CountAllStoresAsync();
        Task<int> CountStoresByIsOpenAsync(bool isOpen);
        Task<int> CountStoresByIsLockedAsync(bool isLocked);
        Task<StatisticalStoreDto> StatisticalStore(Guid storeid);
        Task<SalesAnalysisDto> SalesAnalysis (Guid storeId, DateTime startDate, DateTime endDate);
        Task<Dictionary<int,ProductAndSale>> TopSaleProduct(Guid storeId, DateTime startDate, DateTime endDate);
        Task<List<ProductDetailAndSale>> TopSaleDetail(int productId);
        Task<List<Dictionary<string, decimal>>> GetChartData(Guid storeId, DateTime startDate, DateTime endDate);
    }
}