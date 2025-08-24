namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public interface IProductDbService : IBaseDbService<Product>
    {
        Task<Product> GetByIdAsync(int id);
        Task<Product?> GetByNameAsync(Guid storeId, string name);
        Task<bool> ExistsByNameAsync(Guid storeId, string name, int excludeProductId);
        IQueryable<Product> GetAllProductsQuery();
    }
}
