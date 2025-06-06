namespace ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices
{
    public interface IBuildingDbService
    {
        Task<ResponseModel> GetAllAsync();
        Task<ResponseModel> GetByIdAsync(Guid id);
        Task<ResponseModel> GetByAreaIdOrNameAsync(Guid areaId, string Name);
        Task<ResponseModel> CreateAsync(string name, Guid areaId);
    }
}