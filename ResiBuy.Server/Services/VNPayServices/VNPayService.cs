using ResiBuy.Server.Services.MyBackgroundService.CheckoutSessionService;

namespace ResiBuy.Server.Services.VNPayServices
{
    public class VNPayService(IConfiguration configuration, ICheckoutSessionService checkoutSessionService, IStoreDbService storeDbService) : IVNPayService
    {
        public string CreatePaymentUrl(decimal amount, string orderId, string orderInfo)
        {
            var vnpay = new SortedList<string, string>(new VnPayCompare());
            vnpay.Add("vnp_Amount", ((long)(amount * 100)).ToString());
            vnpay.Add("vnp_Command", "pay");
            vnpay.Add("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.Add("vnp_CurrCode", "VND");
            vnpay.Add("vnp_IpAddr", "::1");
            vnpay.Add("vnp_Locale", "vn");
            vnpay.Add("vnp_OrderInfo", orderInfo);
            vnpay.Add("vnp_OrderType", "other");
            vnpay.Add("vnp_ReturnUrl", configuration.GetValue<string>("VnPay:ReturnUrl"));
            vnpay.Add("vnp_TmnCode", configuration.GetValue<string>("VnPay:TmnCode"));
            vnpay.Add("vnp_TxnRef", orderId.ToString());
            vnpay.Add("vnp_Version", "2.1.0");
            var signData = new StringBuilder();
            foreach (var kv in vnpay)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                    signData.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
            signData.Length -= 1;
            var hash = HmacSHA512(configuration.GetValue<string>("VnPay:HashSecret"), signData.ToString());
            var queryString = string.Join("&", vnpay.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            queryString += "&vnp_SecureHash=" + hash;
            var url = $"{configuration.GetValue<string>("VnPay:BaseUrl")}?{queryString}";
            return url;
        }

        public async Task<string> StorePayFee(Guid storeId)
        {
            var store = await storeDbService.GetStoreByIdAsync(storeId);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Store not found");

            if (store.IsPayFee)
                throw new InvalidOperationException("Store has already paid the fee");

            var feeAmount = configuration.GetValue<decimal>("StoreFee:Amount", 200000); // Default 200,000 VND
            var orderInfo = $"Thanh toan phi cua hang {store.Name}";

            // Tạo payment URL với storeId làm orderId
            var paymentId = storeId.ToString()+"-"+ DateTimeOffset.Now.ToUnixTimeSeconds().ToString();
            return CreatePaymentUrl(feeAmount, paymentId, orderInfo);
        }

        public bool ValidatePayment(string responseData)
        {
            var vnpay = new SortedList<string, string>();
            var responseParams = responseData.Split('&');
            foreach (var param in responseParams)
            {
                var keyValue = param.Split('=');
                if (keyValue.Length == 2)
                {
                    vnpay.Add(keyValue[0], Uri.UnescapeDataString(keyValue[1]));
                }
            }

            var secureHash = vnpay["vnp_SecureHash"];
            vnpay.Remove("vnp_SecureHash");

            var signData = string.Join("&", vnpay.Select(kvp => $"{kvp.Key}={kvp.Value}"));
            var hash = HmacSHA512(configuration.GetValue<string>("VnPay:HashSecret"), signData.ToString());

            return secureHash == hash;
        }

        private string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }
        public async Task<bool> ProcessStorePaymentCallback(string responseData)
        {
            try
            {
                if (!ValidatePayment(responseData))
                    return false;

                var responseParams = ParseResponseData(responseData);

                if (!responseParams.ContainsKey("vnp_ResponseCode") ||
                    responseParams["vnp_ResponseCode"] != "00")
                    return false;

                if (!responseParams.ContainsKey("vnp_TxnRef") ||
                    !Guid.TryParse(responseParams["vnp_TxnRef"], out var storeId))
                    return false;

                var store = await storeDbService.GetStoreByIdAsync(storeId);
                if (store == null)
                    return false;
                store.IsPayFee = true;
                await storeDbService.UpdateAsync(store);

                return true;
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Error processing store payment callback: {ex.Message}");
                return false;
            }

        }

        private Dictionary<string, string> ParseResponseData(string responseData)
        {
            var result = new Dictionary<string, string>();
            var responseParams = responseData.Split('&');

            foreach (var param in responseParams)
            {
                var keyValue = param.Split('=');
                if (keyValue.Length == 2)
                {
                    result[keyValue[0]] = Uri.UnescapeDataString(keyValue[1]);
                }
            }

            return result;
        }
        public class VnPayCompare : IComparer<string>
        {
            public int Compare(string x, string y)
            {
                return CompareInfo.GetCompareInfo("en-US").Compare(x, y, CompareOptions.Ordinal);
            }
        }
    }
}