using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public interface IShipperDbService : IBaseDbService<Shipper>
    {
        Task<PagedResult<Shipper>> GetAllShippersAsync(int pageNumber = 1, int pageSize = 5);
        Task<Shipper> GetShipperByIdAsync(Guid id);
        Task<Shipper> GetShipperByUserIdAsync(string userId);
        Task<Shipper> UpdateShipperLocationAsync(Guid shipperId, Guid locationId);
        Task<Shipper> UpdateShipperStatusAsync(Guid shipperId, bool isOnline);
        Task<IEnumerable<Shipper>> GetAllShippersAsync(int pageNumber, int pageSize, bool? isShipping = null);
        Task UpdateShipperAsync(Shipper shipper);
    }
}