namespace ResiBuy.Server.Infrastructure.DbServices.BaseDbServices
{
    public class BaseDbService<T>(ResiBuyContext context) : IBaseDbService<T> where T : class
    {
        protected readonly DbSet<T> _dbSet = context.Set<T>();

        public virtual async Task<ResponseModel> GetByIdAsync(Guid id)
        {
            try
            {
                return ResponseModel.SuccessResponse(await _dbSet.FindAsync(id));
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel> GetAllAsync()
        {
            try
            {
                return ResponseModel.SuccessResponse(await _dbSet.ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel> CreateAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(entity);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel> CreateBatchAsync(IEnumerable<T> entities)
        {
            try
            {
                await _dbSet.AddRangeAsync(entities);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(entities);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel> UpdateAsync(T entity)
        {
            try
            {
                _dbSet.Update(entity);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(entity);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public virtual async Task<ResponseModel> DeleteAsync(Guid id)
        {
            try
            {
                var getResponse = await GetByIdAsync(id);
                if (!getResponse.IsSuccess()) return ResponseModel.FailureResponse($"Delete {nameof(getResponse.Data)} failed"); ;
                _dbSet.Remove(getResponse.Data as T);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }

        }
    }
}