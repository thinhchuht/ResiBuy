using ResiBuy.BackgroundTask.Model;
using System.Net;
using System.Net.Http.Json;

namespace ResiBuy.BackgroundTask.Services.HttpService
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
                logger.LogInformation(response.StatusCode.ToString());
                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                return ResponseModel.FailureResponse("Không thể tạo đơn hàng");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return ResponseModel.FailureResponse("Không thể tạo đơn hàng");
            }
        }
    }
}   
