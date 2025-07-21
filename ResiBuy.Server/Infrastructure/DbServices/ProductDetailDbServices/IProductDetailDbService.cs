namespace ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices
{
    public interface IProductDetailDbService : IBaseDbService<ProductDetail>
    {
        Task<ProductDetail> GetByIdAsync(int id);
        Task<ResponseModel> CheckIsOutOfStock(List<int> ids);
        Task<List<ProductDetail>> GetByProductIdAsync(int productId);
        Task<List<ProductDetail>> GetBatchAsync(List<int> ids);    
    } 
}
