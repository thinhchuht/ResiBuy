namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    internal class ProcessService(ILogger<ProcessService> logger) : IProcessService
    {
        public async Task<ResponseModel> Process(UpdateOrderStatusDto processData)
        {
            try
            {
                var handler = new HttpClientHandler
                {
                    UseProxy = false // Bỏ qua proxy
                };

                // Tạo HttpClient với handler
                using var client = new HttpClient(handler);
                var response = await client.PostAsJsonAsync("http://localhost:5000/api/Order/process", processData);

                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                var content = await response.Content.ReadAsStringAsync();
                ResponseModel apiResponse = JsonSerializer.Deserialize<ResponseModel>(content); ;
                logger.LogError($"Process API error: {apiResponse?.Message ?? content}");
                return ResponseModel.FailureResponse(apiResponse?.Message ?? "Không thể xử lý đơn hàng");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return ResponseModel.FailureResponse("Không thể tạo đơn hàng");
            }
        }
    }
}
