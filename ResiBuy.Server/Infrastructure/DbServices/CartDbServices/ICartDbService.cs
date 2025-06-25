namespace ResiBuy.Server.Infrastructure.DbServices.CartDbService
{
    public interface ICartDbService: IBaseDbService<Cart>
    {
        Task<Cart> GetByIdAsync(Guid id);
        Task<List<Cart>> GetCheckingOutCartsAsync();
        Task<ResponseModel> ResetStatus(List<Guid> ids);
    }
}