using Microsoft.EntityFrameworkCore.Storage;

namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public class BaseDbService<T>(ResiBuyContext context) : IBaseDbService<T> where T : class
    {
        protected readonly DbSet<T> _dbSet = context.Set<T>();

        public virtual async Task<List<T>> GetAllWithOutInclude()
        {
            try
            {
                return await _dbSet.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> CreateAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<IEnumerable<T>> CreateBatchAsync(IEnumerable<T> entities)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities);
                await context.SaveChangesAsync();
                return entities;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> UpdateAsync(T entity)
        {
            try
            {
                _dbSet.Update(entity);
                await context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
            }
        }

        public virtual async Task<T> DeleteAsync(Guid id)
        {
            try
            {
                var entity = await GetByIdBaseAsync(id); // nếu không tìm thấy sẽ tự throw NotFound
                _dbSet.Remove(entity);
                await context.SaveChangesAsync();
                return entity;
            }
            catch (CustomException)
            {
                throw; // giữ nguyên lỗi NotFound hoặc RepositoryError
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> GetByIdBaseAsync(Guid id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                    return null;
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> GetByIntIdBaseAsync(int id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                    return null;
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<T>> UpdateBatch(IEnumerable<T> entities)
        {
            try
            {
                _dbSet.UpdateRange(entities);
                await context.SaveChangesAsync();
                return entities;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await context.Database.BeginTransactionAsync();
        }

        public virtual async Task<T> CreateTransactionAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<IEnumerable<T>> CreateBatchTransactionAsync(IEnumerable<T> entities)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities);
                return entities;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> UpdateTransactionAsync(T entity)
        {
            try
            {
                _dbSet.Update(entity);
                return entity;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public virtual async Task<T> DeleteTransactionAsync(Guid id)
        {
            try
            {
                var entity = await GetByIdBaseAsync(id); 
                _dbSet.Remove(entity);
                return entity;
            }
            catch (CustomException)
            {
                throw; 
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<T>> UpdateTransactionBatch(IEnumerable<T> entities)
        {
            try
            {
                _dbSet.UpdateRange(entities);
                return entities;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> SaveChangesAsync()
        {
            return await context.SaveChangesAsync();
        }
        public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities);
                return entities;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}