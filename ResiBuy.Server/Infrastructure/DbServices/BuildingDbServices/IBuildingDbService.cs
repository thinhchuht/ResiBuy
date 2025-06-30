namespace ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices
{
    public interface IBuildingDbService: IBaseDbService<Building>
    {
        Task<IEnumerable<Building>> GetAllAsync();
        Task<Building> GetByIdAsync(Guid id);
        Task<IEnumerable<Building>> GetByAreaIdAsync(Guid id);
        Task<Building> CreateAsync(string name, Guid areaId);
        Task<Building> GetBuildingByNameAndAreaIdAssync(string name, Guid areaId);
    }
}