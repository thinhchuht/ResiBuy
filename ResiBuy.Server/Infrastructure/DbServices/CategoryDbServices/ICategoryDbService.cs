using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices
{
    public interface ICategoryDbService : IBaseDbService<Category>
    {
        Task<Category> GetByIdAsync(Guid id);
        Task<IEnumerable<Category>> GetAllCategoryAsync();
        Task<int> CountAllCategoriesAsync();
        Task<int> CountProductsByCategoryIdAsync(Guid categoryId);

    }
}
