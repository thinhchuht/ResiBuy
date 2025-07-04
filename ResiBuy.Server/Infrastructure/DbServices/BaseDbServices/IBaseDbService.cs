using Microsoft.EntityFrameworkCore.Storage;

namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public interface IBaseDbService<T> where T : class
    {
        Task<List<T>> GetAllWithOutInclude();
        Task<T> GetByIdBaseAsync(Guid id);
        Task<T> GetByIntIdBaseAsync(int id);
        Task<T> CreateAsync(T entity);
        Task<IEnumerable<T>> UpdateBatch(IEnumerable<T> entities);
        Task<IEnumerable<T>> CreateBatchAsync(IEnumerable<T> entities);
        Task<T> UpdateAsync(T entity);
        Task<T> DeleteAsync(Guid id);
        Task<IDbContextTransaction> BeginTransactionAsync();

        Task<T> CreateTransactionAsync(T entity);
        Task<IEnumerable<T>> CreateBatchTransactionAsync(IEnumerable<T> entities);

        Task<T> UpdateTransactionAsync(T entity);
        Task<IEnumerable<T>> UpdateTransactionBatch(IEnumerable<T> entities);

        Task<T> DeleteTransactionAsync(Guid id);

        Task<int> SaveChangesAsync();
    }
}