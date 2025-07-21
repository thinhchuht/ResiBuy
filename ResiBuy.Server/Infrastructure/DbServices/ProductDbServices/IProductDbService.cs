namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public interface IProductDbService : IBaseDbService<Product>
    {
        Task<Product> GetByIdAsync(int id);
        IQueryable<Product> GetAllProductsQuery();
    }
}
