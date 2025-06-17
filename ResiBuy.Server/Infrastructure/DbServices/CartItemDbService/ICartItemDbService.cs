namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public interface ICartItemDbService : IBaseDbService<CartItem>
    {
        Task<CartItem> GetProductInCartAsync(Guid productId, Guid cartId);
        Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds);
    }
}