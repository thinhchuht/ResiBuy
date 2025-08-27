namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    public class ProcessService(HttpClient httpClient, ILogger<ProcessService> logger) : IProcessService
    {
        public async Task<ResponseModel> Process(UpdateOrderStatusDto processData)
        {
            try
            {
                // Sử dụng HttpClient được DI cung cấp (đã cấu hình BaseAddress trong Program.cs)
                var response = await httpClient.PostAsJsonAsync("Order/process", processData);

                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                var content = await response.Content.ReadAsStringAsync();
                ResponseModel? apiResponse = JsonSerializer.Deserialize<ResponseModel>(content);
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
