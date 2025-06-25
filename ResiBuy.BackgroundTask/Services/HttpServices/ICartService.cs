namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    public interface ICartService
    {
        Task<ResponseModel> GetCheckingOutCarts();
        Task<ResponseModel> ResetStatus(List<Guid> ids);
    }
}
