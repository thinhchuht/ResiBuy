namespace ResiBuy.Server.Infrastructure.Services.BaseDbServices
{
    public interface IBaseService<T> where T : class
    {
        Task<ResponseModel> GetByIdAsync(Guid id);
        Task<ResponseModel> GetAllAsync();
        Task<ResponseModel> CreateAsync(T entity);
        Task<ResponseModel> CreateBatchAsync(IEnumerable<T> entities);
        Task<ResponseModel> UpdateAsync(T entity);
        Task<ResponseModel> DeleteAsync(Guid id);
    }
}