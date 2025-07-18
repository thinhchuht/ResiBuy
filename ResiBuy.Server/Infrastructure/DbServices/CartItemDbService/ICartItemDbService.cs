namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public interface ICartItemDbService : IBaseDbService<CartItem>
    {
        Task<IEnumerable<CartItem>> GetMatchingCartItemsAsync(Guid cartId, IEnumerable<int> productDetailIds);
        Task<IEnumerable<CartItem>> GetBatchCartItemsAsync(List<Guid> ids);
        Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds);
        Task<ResponseModel> DeleteBatchByProductDetailIdAsync(Guid cartId, IEnumerable<int> productDetailIds);
        Task<PagedResult<CartItem>> GetCartItemsByCartIdAsync(Guid cartId, int pageNumber, int pageSize);
        Task<int> GetCartItemsCountAsync(Guid cartId);
    }
}