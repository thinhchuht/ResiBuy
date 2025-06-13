using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public interface IProductDbService : IBaseDbService<Product>
    {
        Task<Product> GetByIdAsync(Guid id);
        Task<Product> GetProductByIdWithStoreAsync(Guid id);
        Task<PagedResult<Product>> GetAllProducts(int pageNumber, int pageSize);
    }
}
