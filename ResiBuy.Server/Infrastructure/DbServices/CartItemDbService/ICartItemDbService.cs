namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public interface ICartItemDbService : IBaseDbService<CartItem>
    {
        Task<CartItem> GetMatchingCartItemsAsync(Guid cartId, int productDetailId);
        Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds);
        Task<PagedResult<CartItem>> GetCartItemsByCartIdAsync(Guid cartId, int pageNumber, int pageSize);
    }
}