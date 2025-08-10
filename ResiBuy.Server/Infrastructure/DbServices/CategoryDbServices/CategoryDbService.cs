
using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Infrastructure.Filter;
using ResiBuy.Server.Infrastructure.Model;
using ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos;

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
                var categories = await _context.Categories.Include(c => c.Image).ToListAsync();
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
                var category = await _context.Categories.Include(c => c.Image).FirstOrDefaultAsync(a => a.Id == id);
                return category;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> CountAllCategoriesAsync()
        {
            try
            {
                return await _context.Categories.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> CountProductsByCategoryIdAsync(Guid categoryId)
        {
            try
            {
                if (categoryId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id danh mục không hợp lệ.");

                return await _context.Products.CountAsync(p => p.CategoryId == categoryId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<List<CategoryPercentageDto>> GetCategoryPercentagesAsync()
        {
            try
            {
                var totalProducts = await _context.Products.CountAsync();

                var productCounts = await _context.Products
                    .GroupBy(p => p.CategoryId)
                    .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(g => g.CategoryId, g => g.Count);

                var percentages = await _context.Categories
                    .Select(c => new CategoryPercentageDto
                    {
                        Name = c.Name,
                        Value = Math.Round(totalProducts > 0 ? (double)(productCounts.ContainsKey(c.Id) ? productCounts[c.Id] : 0) / totalProducts * 100 : 0,2)
                    })
                    .ToListAsync();

                return percentages;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
