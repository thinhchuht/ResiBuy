namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    public interface IProcessService
    {
        Task<ResponseModel> Process(UpdateOrderStatusDto processData);
    }
}