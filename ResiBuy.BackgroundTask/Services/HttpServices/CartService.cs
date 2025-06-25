namespace ResiBuy.BackgroundTask.Services.HttpServices
{
    internal class CartService : ICartService
    {
        public async Task<ResponseModel> GetCheckingOutCarts()
        {
            try
            {
                var handler = new HttpClientHandler
                {
                    UseProxy = false // Bỏ qua proxy
                };

                // Tạo HttpClient với handler
                using var client = new HttpClient(handler);
                var response = await client.GetAsync($"http://localhost:5000/api/Cart/checking-out");
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    // Đọc dữ liệu JSON trả về
                    var carts = await response.Content.ReadFromJsonAsync<List<Cart>>();
                    return ResponseModel.SuccessResponse(carts);
                }
                return ResponseModel.FailureResponse("Không thể lấy danh sách cart");
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse("Không thể lấy danh sách cart");
            }
        }

        public async Task<ResponseModel> ResetStatus(List<Guid> ids)
        {
            try
            {
                var handler = new HttpClientHandler
                {
                    UseProxy = false // Bỏ qua proxy
                };

                // Tạo HttpClient với handler
                using var client = new HttpClient(handler);
                var response = await client.PostAsJsonAsync($"http://localhost:5000/api/Cart/reset-status", ids );
                if (response.StatusCode == HttpStatusCode.OK) return ResponseModel.SuccessResponse();
                return ResponseModel.FailureResponse("Lỗi khi đổi trạng thái của giỏ hàng");
            }
            catch (Exception ex)
            {
                return ResponseModel.FailureResponse("Lỗi khi đổi trạng thái của giỏ hàng");
            }
        }
    }
}
