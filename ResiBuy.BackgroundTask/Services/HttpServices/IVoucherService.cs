namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    public interface IVoucherService
    {
        Task<ResponseModel> DeactivateBatchVoucher();
    }
}