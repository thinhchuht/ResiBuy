namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public interface IAreaDbService
    {
        Task<IEnumerable<Area>> GetAllAreaAsync();
        Task<Area> GetByIdAsync(Guid id);
    }
}