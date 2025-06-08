using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices
{
    public interface IBuildingDbService
    {
        Task<IEnumerable<Building>> GetAllAsync();
        Task<Building> GetByIdAsync(Guid id);
        Task<Building> CreateAsync(string name, Guid areaId);
        Task<Building> GetBuildingByNameAndAreaIdAssync(string name, Guid areaId);
    }
}