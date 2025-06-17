namespace ResiBuy.Server.Infrastructure.DbServices.CartDbService
{
    public interface ICartDbService: IBaseDbService<Cart>
    {
        Task<Cart> GetByIdAsync(Guid id);
    }
}