using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;
using ResiBuy.Server.Services.MyBackgroundService.CheckoutSessionService;
using ResiBuy.Server.Services.RedisServices;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VNPayController(IVNPayService vnPayService, IVoucherDbService voucherDbService, ICheckoutSessionService checkoutSessionService, IRedisService redisService,
        IKafkaProducerService producer, ILogger<VNPayController> logger, ResiBuyContext dbContext) : ControllerBase
    {
        private static readonly Dictionary<string, DateTime> _paymentTokens = new();

        [HttpPost("create-payment")]
        public async Task<IActionResult> CreatePaymentAsync([FromQuery] string userId, [FromQuery] Guid checkoutId)
        {
            var db =  redisService.GetDatabase();
            var key = $"temp_order:{userId}-{checkoutId}";
            var json = await db.StringGetAsync(key);
            if (json.IsNullOrEmpty)
                throw new CustomException(ExceptionErrorCode.InvalidInput, "Đơn hàng đã hết hạn hoặc không tồn tại, hãy thử lại nhé");
            var checkoutData = JsonSerializer.Deserialize<TempCheckoutDto>(json!);
            var user = dbContext.Users.Include(u => u.Cart).FirstOrDefault(u => u.Id == userId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại người dùng");
            var cart = dbContext.Carts.FirstOrDefault(c => c.Id == user.Cart.Id) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại giỏ hàng");
            if (cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giỏ hàng đang được thanh toán ở nơi khác. Thử lại sau ít phút.");
            // Kiểm tra voucher
            var voucherIds = checkoutData.Orders.Select(o => o.VoucherId).ToList();
            var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers(voucherIds);
            if (!checkVoucherRs.IsSuccess()) throw new CustomException(ExceptionErrorCode.ValidationFailed, checkVoucherRs.Message);
            cart.IsCheckingOut = true;
            cart.ExpiredCheckOutTime = DateTime.Now.AddSeconds(15);
            dbContext.SaveChanges();
            var paymentId = Guid.NewGuid();
            checkoutSessionService.StoreCheckoutSession(paymentId, checkoutData);
            var paymentUrl = vnPayService.CreatePaymentUrl(checkoutData.GrandTotal, paymentId.ToString(), $"ResiBuy");
            return Ok(new { paymentUrl });
        }

        [HttpGet("payment-callback")]
        public async Task<IActionResult> PaymentCallbackAsync([FromQuery] VNPayCallback callback)
        {
            var responseData = Request.QueryString.ToString().TrimStart('?');
            if (!vnPayService.ValidatePayment(responseData))
            {
                var token = GenerateToken();
                _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                return Redirect($"http://localhost:5001/checkout-failed?token={token}");
            }

            if (callback.vnp_ResponseCode == "00" && callback.vnp_TransactionStatus == "00")
            {
                var sessionId = callback.vnp_TxnRef;
                if (callback.vnp_OrderInfo.Contains("Thanh toan phi cua hang"))
                {
                    var storeId = callback.vnp_TxnRef[..callback.vnp_TxnRef.LastIndexOf('-')];

                    var isStorePaymentSuccess = await vnPayService.ProcessStorePaymentCallback(responseData);

                    if (isStorePaymentSuccess)
                    {
                        var token = GenerateToken();
                        _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                        return Redirect($"http://localhost:5001/store/{storeId}");
                    }
                    else
                    {
                        var token = GenerateToken();
                        _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                        return Redirect($"http://localhost:5001/paymentFail");
                    }
                }
                else
                {
                    // Xử lý order payment như cũ
                    var checkoutData = checkoutSessionService.GetCheckoutSession(sessionId);

                    if (checkoutData != null)
                    {
                        var checkoutDto = new CheckoutDto
                        {
                            UserId = checkoutData.UserId,
                            GrandTotal = checkoutData.GrandTotal,
                            AddressId = checkoutData.AddressId ?? Guid.Empty,
                            PaymentMethod = checkoutData.PaymentMethod,
                            IsInstance = checkoutData.IsInstance,
                            Orders = checkoutData.Orders.Select(order => new OrderDto
                            {
                                Id = order.Id,
                                StoreId = order.StoreId,
                                VoucherId = order.VoucherId,
                                Note = order.Note,
                                TotalPrice = order.TotalPrice,
                                ShippingFee = order.ShippingFee,
                                Items = order.ProductDetails.Select(pd => new OrderItemDto
                                {
                                    ProductDetailId = pd.Id,
                                    Quantity = pd.Quantity,
                                    Price = pd.Price
                                }).ToList()
                            }).ToList()
                        };
                        try
                        {
                            var message = JsonSerializer.Serialize(checkoutDto);
                            producer.ProduceMessageAsync("checkout", message, "checkout-topic");
                            checkoutSessionService.RemoveCheckoutSession(sessionId);
                            var token = GenerateToken();
                            _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                            logger.LogError(token);
                            logger.LogError(_paymentTokens[token].ToString());
                            return Redirect($"http://localhost:5001/checkout-success?token={token}");
                        }
                        catch (Exception)
                        {
                            var token = GenerateToken();
                            _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                            return Redirect($"http://localhost:5001/checkout-failed?token={token}");
                        }
                    }
                    else
                    {
                        var token = GenerateToken();
                        _paymentTokens[token] = DateTime.Now.AddMinutes(5);
                        return Redirect($"http://localhost:5001/checkout-failed?token={token}");
                    }
                }
            }

            var failedToken = GenerateToken();
            _paymentTokens[failedToken] = DateTime.Now.AddMinutes(5);
            return Redirect($"http://localhost:5001/checkout-failed?token={failedToken}");
        }

        [HttpGet("verify-payment-token")]
        public IActionResult VerifyPaymentToken([FromQuery] string token)
        {
            if (_paymentTokens.TryGetValue(token, out var expiryTime))
            {
                if (DateTime.Now <= expiryTime)
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

        [HttpPost("create-store-payment/{storeId}")]
        public async Task<IActionResult> CreateStorePayment(Guid storeId)
        {
            try
            {
                var paymentUrl = vnPayService.StorePayFee(storeId);
                return Ok(new { PaymentUrl = paymentUrl });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        private string GenerateToken()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var token = new char[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] data = new byte[32];
                rng.GetBytes(data);
                for (int i = 0; i < token.Length; i++)
                {
                    token[i] = chars[data[i] % chars.Length];
                }
            }
            return new string(token);
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