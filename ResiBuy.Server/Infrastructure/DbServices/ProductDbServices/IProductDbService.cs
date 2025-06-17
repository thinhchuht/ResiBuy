using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public interface IProductDbService : IBaseDbService<Product>
    {
        Task<Product> GetByIdAsync(int id);
        Task<Product> GetProductByIdWithStoreAsync(int id);
        Task<PagedResult<Product>> GetAllProducts(int pageNumber, int pageSize);
    }
}
