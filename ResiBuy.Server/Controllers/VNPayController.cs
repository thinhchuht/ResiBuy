using ResiBuy.Server.Services.CheckoutSessionService;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VNPayController(IVNPayService vnPayService, ICheckoutSessionService checkoutSessionService, IKafkaProducerService producer, ResiBuyContext dbContext) : ControllerBase
    {
        private static readonly Dictionary<string, DateTime> _paymentTokens = new();

        [HttpPost("create-payment")]
        public IActionResult CreatePayment([FromBody] CheckoutDto dto)
        {
            var user = dbContext.Users.Include(u => u.Cart).FirstOrDefault(u => u.Id == dto.UserId);
            var cart = dbContext.Carts.FirstOrDefault(c => c.Id == user.Cart.Id);
            if (cart == null)
                return NotFound();

            if (cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng đang được thanh toán ở nơi khác. Thử lại sau ít phút.");
            cart.IsCheckingOut = true;
            cart.ExpiredCheckOutTime = DateTime.UtcNow.AddMinutes(15);
            try
            {
                dbContext.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Có người khác đang thao tác với giỏ hàng này. Vui lòng thử lại.");
            }

            var paymentId = Guid.NewGuid();
            checkoutSessionService.StoreCheckoutSession(paymentId, dto);
            var paymentUrl = vnPayService.CreatePaymentUrl(dto.GrandTotal, paymentId, $"ResiBuy");
            return Ok(new { paymentUrl });
        }

        [HttpGet("payment-callback")]
        public IActionResult PaymentCallbackAsync([FromQuery] VNPayCallback callback)
        {
            var responseData = Request.QueryString.ToString().TrimStart('?');
            if (!vnPayService.ValidatePayment(responseData))
            {
                var token = GenerateToken();
                _paymentTokens[token] = DateTime.UtcNow.AddMinutes(5);
                return Redirect($"http://localhost:5001/checkout-failed?token={token}");
            }

            if (callback.vnp_ResponseCode == "00" && callback.vnp_TransactionStatus == "00")
            {
                var sessionId = callback.vnp_TxnRef;
                var checkoutData = checkoutSessionService.GetCheckoutSession(sessionId);

                if (checkoutData != null)
                {
                    try
                    {
                        //var message = JsonSerializer.Serialize(checkoutData);
                        // producer.ProduceMessageAsync("checkout", message, "checkout-topic");
                        //checkoutSessionService.RemoveCheckoutSession(sessionId);
                        var token = GenerateToken();
                        _paymentTokens[token] = DateTime.UtcNow.AddMinutes(5);
                        return Redirect($"http://localhost:5001/checkout-success?token={token}");
                    }
                    catch (Exception)
                    {
                        var token = GenerateToken();
                        _paymentTokens[token] = DateTime.UtcNow.AddMinutes(5);
                        return Redirect($"http://localhost:5001/checkout-failed?token={token}");
                    }
                }
                else
                {
                    var token = GenerateToken();
                    _paymentTokens[token] = DateTime.UtcNow.AddMinutes(5);
                    return Redirect($"http://localhost:5001/checkout-failed?token={token}");
                }
            }

            var failedToken = GenerateToken();
            _paymentTokens[failedToken] = DateTime.UtcNow.AddMinutes(5);
            return Redirect($"http://localhost:5001/checkout-failed?token={failedToken}");
        }

        [HttpGet("verify-payment-token")]
        public IActionResult VerifyPaymentToken([FromQuery] string token)
        {
            if (_paymentTokens.TryGetValue(token, out var expiryTime))
            {
                if (DateTime.UtcNow <= expiryTime)
                {
                    return Ok(new { isValid = true });
                }
                _paymentTokens.Remove(token);
            }
            return Ok(new { isValid = false });
        }

        [HttpPost("invalidate-payment-token")]
        public IActionResult InvalidatePaymentToken([FromQuery] string token)
        {
            if (_paymentTokens.ContainsKey(token))
            {
                _paymentTokens.Remove(token);
                return Ok(new { success = true });
            }
            return Ok(new { success = false });
        }

        private string GenerateToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }
    }

    public class VNPayCallback
    {
        public string vnp_Amount { get; set; } = string.Empty;
        public string vnp_BankCode { get; set; } = string.Empty;
        public string vnp_BankTranNo { get; set; } = string.Empty;
        public string vnp_CardType { get; set; } = string.Empty;
        public string vnp_OrderInfo { get; set; } = string.Empty;
        public string vnp_PayDate { get; set; } = string.Empty;
        public string vnp_ResponseCode { get; set; } = string.Empty;
        public string vnp_TmnCode { get; set; } = string.Empty;
        public string vnp_TransactionNo { get; set; } = string.Empty;
        public string vnp_TransactionStatus { get; set; } = string.Empty;
        public string vnp_TxnRef { get; set; } = string.Empty;
        public string vnp_SecureHash { get; set; } = string.Empty;
    }
}