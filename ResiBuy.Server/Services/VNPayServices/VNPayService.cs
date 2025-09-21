using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using System.Data;
using ResiBuy.Server.Infrastructure;
using Microsoft.EntityFrameworkCore;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Services.VNPayServices
{
    public class VNPayService(IConfiguration configuration, IStoreDbService storeDbService, IOrderDbService orderDbService, ResiBuyContext _dbContext) : IVNPayService
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


        public async Task<string> CustomerPay(Guid orderId)
        {
            var order = await orderDbService.GetById(orderId);
            if (order == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "order not found");

            var amount = order.TotalPrice;


            var orderInfo = cartId.HasValue ? $"Thanh toan hoa don {orderId},{cartId.Value}" : $"Thanh toan hoa don {orderId}";
            return CreatePaymentUrl(amount, orderId.ToString(), orderInfo);
        }


        public async Task<string> StorePayFee(Guid storeId)
        {
            var store = await storeDbService.GetStoreByIdAsync(storeId);
            if (store == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Store not found");

            if (store.IsPayFee)
                throw new InvalidOperationException("Store has already paid the fee");

            var feeAmount = configuration.GetValue<decimal>("StoreFee:Amount", 200000); // Default 200,000 VND
            var orderInfo = $"Thanh toan phi cua hang {store.Id}";

            // Tạo payment URL với storeId làm orderId
            var paymentId = storeId.ToString() + "-" + DateTimeOffset.Now.ToUnixTimeSeconds().ToString();
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

        public async Task<bool> ProcessOrderPaymentCallback(string responseData, Guid orderId)
        {
            try
            {
                Console.WriteLine($"Processing order payment callback for orderId: {orderId}");

                // Parse response data directly (validation already done in controller)
                var responseParams = ParseResponseData(responseData);
                Console.WriteLine($"Response code: {responseParams.GetValueOrDefault("vnp_ResponseCode", "NOT_FOUND")}");
                Console.WriteLine($"Transaction status: {responseParams.GetValueOrDefault("vnp_TransactionStatus", "NOT_FOUND")}");

                // Get the order and update payment status
                var order = await orderDbService.GetById(orderId);
                if (order == null)
                {
                    Console.WriteLine($"Order not found for orderId: {orderId}");
                    return false;
                }

                Console.WriteLine($"Found order: {order.Id}, current payment status: {order.PaymentStatus}");

                order.PaymentStatus = PaymentStatus.Paid;
                await orderDbService.UpdateAsync(order);

                Console.WriteLine($"Successfully updated order payment status to Paid");
                return true;
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Error processing order payment callback: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<bool> RollbackOrderPaymentAsync(Guid orderId)
        {
            await using var tx = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var order = await _dbContext.Orders
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return false;

                foreach (var item in order.Items)
                {
                    var productDetail = await _dbContext.ProductDetails
                        .FirstOrDefaultAsync(p => p.Id == item.ProductDetailId);
                    if (productDetail != null)
                    {
                        // restore quantity
                        productDetail.Quantity += item.Quantity;
                        // decrease sold count but not below 0
                        productDetail.Sold = Math.Max(0, productDetail.Sold - item.Quantity);
                        if (productDetail.Quantity > 0 && productDetail.IsOutOfStock)
                        {
                            productDetail.IsOutOfStock = false;
                        }
                    }
                }

                // restore voucher quantity if present
                if (order.VoucherId.HasValue)
                {
                    var voucher = await _dbContext.Vouchers.FindAsync(order.VoucherId.Value);
                    if (voucher != null)
                    {
                        voucher.Quantity += 1;
                        voucher.IsActive = voucher.Quantity > 0;
                    }
                }

                order.PaymentStatus = PaymentStatus.Failed;
                order.Status = OrderStatus.Cancelled;
                order.UpdateAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();
                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
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
                    !Guid.TryParse(responseParams["vnp_TxnRef"][..responseParams["vnp_TxnRef"].LastIndexOf('-')], out var orderId))
                    return false;

                var order = await orderDbService.GetById(orderId);
                if (order == null)
                    return false;
                order.PaymentStatus = PaymentStatus.Paid;
                await orderDbService.UpdateAsync(order);

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