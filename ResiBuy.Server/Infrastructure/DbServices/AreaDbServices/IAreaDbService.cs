namespace ResiBuy.Server.Infrastructure.DbServices.AreaDbServices
{
    public interface IAreaDbService: IBaseDbService<Area>
    {
        Task<int> CountAsync();
        Task<IEnumerable<Area>> GetAllAreaAsync(bool getActive);
        Task<Area> GetByIdAsync(Guid id);
        Task<Area> NearestAreaHasShipper(Guid currenId);
        Task<bool> IsNameExistsAsync(string name);

    }
}