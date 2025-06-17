namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public interface ICartItemDbService : IBaseDbService<CartItem>
    {
        Task<CartItem> GetProductInCartAsync(int productDetailId, Guid cartId);
        Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds);
    }
}