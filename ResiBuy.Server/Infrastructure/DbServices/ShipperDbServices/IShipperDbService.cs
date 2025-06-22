using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices
{
    public interface IShipperDbService : IBaseDbService<Shipper>
    {
        Task<IEnumerable<Shipper>> GetAllShippersAsync();
        Task<Shipper> GetShipperByIdAsync(Guid id);
        Task<Shipper> GetShipperByUserIdAsync(string userId);
        Task<Shipper> UpdateShipperLocationAsync(Guid shipperId, Guid locationId);
        Task<Shipper> UpdateShipperStatusAsync(Guid shipperId, bool isOnline);
    }
} 