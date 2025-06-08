namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public interface IAreaDbService: IBaseDbService<Area>
    {
        Task<IEnumerable<Area>> GetAllAreaAsync();
        Task<Area> GetByIdAsync(Guid id);
    }
}