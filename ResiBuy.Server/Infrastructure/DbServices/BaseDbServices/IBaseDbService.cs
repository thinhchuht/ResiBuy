namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public interface IBaseDbService<T> where T : class
    {
        Task<List<T>> GetAllWithOutInclude();
        Task<T> GetByIdBaseAsync(Guid id);
        Task<T> GetByIntIdBaseAsync(int id);
        Task<T> CreateAsync(T entity);
        Task<IEnumerable<T>> CreateBatchAsync(IEnumerable<T> entities);
        Task<T> UpdateAsync(T entity);
        Task<T> DeleteAsync(Guid id);
    }
}