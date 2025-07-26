namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public interface IAreaDbService: IBaseDbService<Area>
    {
        Task<int> CountAsync();
        Task<IEnumerable<Area>> GetAllAreaAsync();
        Task<Area> GetByIdAsync(Guid id);
        Task<Area> NearestAreaHasShipper(Guid currenId);
    }
}