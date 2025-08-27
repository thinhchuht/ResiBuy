namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    internal interface IProcessService
    {
        Task<ResponseModel> Process(UpdateOrderStatusDto processData);
    }
}