using ResiBuy.Server.Infrastructure.Filter;
using System.Numerics;

namespace ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices
{
    public interface ICategoryDbService : IBaseDbService<Category>
    {
        Task<Category> GetByIdAsync(Guid id);
        Task<IEnumerable<Category>> GetAllCategoryAsync();
        Task<PagedResult<Product>> GetPagedProductsByCategoryIdAsync(Guid categoryId, int pageNumber, int pageSize);
    }
}
