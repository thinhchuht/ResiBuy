namespace ResiBuy.Server.Infrastructure.Services.BuildingServices
{
    public interface IBuildingService
    {
        Task<ResponseModel> GetAllAsync();
        Task<ResponseModel> GetByIdAsync(Guid id);
        Task<ResponseModel> GetByAreaIdOrNameAsync(Guid areaId, string Name);
        Task<ResponseModel> CreateAsync(string name, Guid areaId);
    }
}