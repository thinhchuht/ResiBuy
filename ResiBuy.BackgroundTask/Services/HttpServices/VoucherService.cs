namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    internal class VoucherService(HttpClient httpClient, ILogger<VoucherService> logger) : IVoucherService
    {
        public async Task<ResponseModel> DeactivateBatchVoucher()
        {
            try
            {
                var handler = new HttpClientHandler
                {
                    UseProxy = false // Bỏ qua proxy
                };

                // Tạo HttpClient với handler
                using var client = new HttpClient(handler);
                var response = await client.GetAsync("http://localhost:5000/api/voucher/batch/deactive");
                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                var content = await response.Content.ReadAsStringAsync();
                ResponseModel apiResponse = JsonSerializer.Deserialize<ResponseModel>(content); ;
                logger.LogError($"Checkout API error: {apiResponse?.Message ?? content}");
                return ResponseModel.FailureResponse("Lỗi xảy ra khi vô hiệu hóa mã giảm giá");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return ResponseModel.FailureResponse("Lỗi xảy ra khi vô hiệu hóa mã giảm giá");
            }
        }
    }
}
