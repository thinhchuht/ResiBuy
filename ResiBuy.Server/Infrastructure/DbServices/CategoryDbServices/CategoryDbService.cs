
using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices
{
    public class CategoryDbService : BaseDbService<Category>, ICategoryDbService
    {
        private readonly ResiBuyContext _context;
        public CategoryDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategoryAsync()
        {
            try
            {
                var categories = await _context.Categories.ToListAsync();
                if (categories == null)
                {
                    return null;
                }
                return categories;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Category> GetByIdAsync(Guid id)
        {
            try
            {
                var category = await _context.Categories.FirstOrDefaultAsync(a => a.Id == id);
                if (category == null)
                {
                    return null;
                }
                return category;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<PagedResult<Product>> GetPagedProductsByCategoryIdAsync(Guid categoryId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Products
                    .Where(p => p.CategoryId == categoryId)
                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(p => p.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Product>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
