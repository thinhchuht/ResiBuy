namespace ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices
{
    public interface IProductDetailDbService : IBaseDbService<ProductDetail>
    {
        Task<ProductDetail> GetByIdAsync(int id);
    }
}
