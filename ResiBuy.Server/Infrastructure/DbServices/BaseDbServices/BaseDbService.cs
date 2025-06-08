namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public class BaseDbService<T>(ResiBuyContext context) : IBaseDbService<T> where T : class
    {
        protected readonly DbSet<T> _dbSet = context.Set<T>();

        public virtual async Task<ResponseModel<T>> GetByIdAsync(Guid id)
        {
            try
            {
                return ResponseModel<T>.SuccessResponse(await _dbSet.FindAsync(id));
            }
            catch (Exception ex)
            {
                return ResponseModel<T>.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel<IEnumerable<T>>> GetAllAsync()
        {
            try
            {
                return ResponseModel<IEnumerable<T>>.SuccessResponse(await _dbSet.ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<IEnumerable<T>>.FailureResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel<T>> CreateAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await context.SaveChangesAsync();
                return ResponseModel<T>.SuccessResponse(entity);
            }
            catch (Exception ex)
            {
                return ResponseModel<T>.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel<IEnumerable<T>>> CreateBatchAsync(IEnumerable<T> entities)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities);
                await context.SaveChangesAsync();
                return ResponseModel<IEnumerable<T>>.SuccessResponse(entities);
            }
            catch (Exception ex)
            {
                return ResponseModel<IEnumerable<T>>.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel<T>> UpdateAsync(T entity)
        {
            try
            {
                _dbSet.Update(entity);
                await context.SaveChangesAsync();
                return ResponseModel<T>.SuccessResponse(entity);
            }
            catch (Exception ex)
            {
                return ResponseModel<T>.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel<T>> DeleteAsync(Guid id)
        {
            try
            {
                var getResponse = await GetByIdAsync(id);
                if (!getResponse.IsSuccess()) return ResponseModel<T>.FailureResponse($"Delete {nameof(getResponse.Data)} failed"); ;
                _dbSet.Remove(getResponse.Data as T);
                await context.SaveChangesAsync();
                return ResponseModel<T>.SuccessResponse();
            }
            catch (Exception ex)
            {
                return ResponseModel<T>.ExceptionResponse(ex.ToString());
            }

        }
    }
}