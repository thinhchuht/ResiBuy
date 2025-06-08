namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public interface IBaseDbService<T> where T : class
    {
        Task<ResponseModel<T>> GetByIdAsync(Guid id);
        Task<ResponseModel<IEnumerable<T>>> GetAllAsync();
        Task<ResponseModel<T>> CreateAsync(T entity);
        Task<ResponseModel<IEnumerable<T>>> CreateBatchAsync(IEnumerable<T> entities);
        Task<ResponseModel<T>> UpdateAsync(T entity);
        Task<ResponseModel<T>> DeleteAsync(Guid id);
    }
}