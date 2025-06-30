namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    public class CheckoutService(HttpClient httpClient, ILogger<CheckoutService> logger) : ICheckoutService
    {
        public async Task<ResponseModel> Checkout(CheckoutData checkoutData)
        {
            try
            {
                var handler = new HttpClientHandler
                {
                    UseProxy = false // Bỏ qua proxy
                };

                // Tạo HttpClient với handler
                using var client = new HttpClient(handler);
                var response = await client.PostAsJsonAsync("http://localhost:5000/api/Order", checkoutData);

                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                var content = await response.Content.ReadAsStringAsync();
                ResponseModel apiResponse = JsonSerializer.Deserialize<ResponseModel>(content); ;
                logger.LogError($"Checkout API error: {apiResponse?.Message ?? content}");
                return ResponseModel.FailureResponse(apiResponse?.Message ?? "Không thể tạo đơn hàng");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return ResponseModel.FailureResponse("Không thể tạo đơn hàng");
            }
        }
    }
}   
