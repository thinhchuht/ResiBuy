namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public interface ICartItemDbService : IBaseDbService<CartItem>
    {
        Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds);
    }
}