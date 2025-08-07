using ResiBuy.Server.Services.MapBoxService;
using ResiBuy.Server.Services.OpenRouteService;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public interface IShipperDbService : IBaseDbService<Shipper>
    {
        Task<PagedResult<Shipper>> GetAllShippersAsync(int pageNumber = 1, int pageSize = 5);
        Task<Shipper> GetShipperByIdAsync(Guid id);
        Task<Shipper> GetShipperByUserIdAsync(string userId);
        Task<Shipper> UpdateShipperLocationAsync(Guid shipperId, Guid locationId);
        Task<Shipper> UpdateShipperStatusAsync(Guid shipperId, bool isOnline);
        Task<DirectionsResponse> GetDistanceAsync(Guid curentAreaId, Guid destinationAreaId);
        Task<List<Shipper>> GetShippersInAreaAsync(Guid areaId);
        Task<int> CountShippersByOnlineStatusAsync(bool isOnline);
        Task<int> CountShippersByShippingStatusAsync(bool isShipping);
        Task<int> SumShipperReportCountAsync();
        Task<int> CountAllShipper();
        Task<int> SumShipperLockedAsync();
    }
}