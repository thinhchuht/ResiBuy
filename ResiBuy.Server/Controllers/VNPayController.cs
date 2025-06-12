using Microsoft.AspNetCore.Mvc;
using ResiBuy.Server.Services.VNPayServices;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VNPayController : ControllerBase
    {
        private readonly IVNPayService _vnPayService;

        public VNPayController(IVNPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        [HttpPost("create-payment")]
        public IActionResult CreatePayment([FromBody] PaymentRequest request)
        {
            var paymentUrl = _vnPayService.CreatePaymentUrl(
                amount: request.Amount,
                orderId: request.OrderId,
                orderInfo: request.OrderInfo
            );
            return Ok(new { paymentUrl });
        }

        [HttpGet("payment-callback")]
        public IActionResult PaymentCallback([FromQuery] string vnp_ResponseCode)
        {
            // Xử lý callback từ VNPAY
            if (vnp_ResponseCode == "00")
            {
                return Ok(new { message = "Thanh toán thành công" });
            }
            return BadRequest(new { message = "Thanh toán thất bại" });
        }
    }

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string OrderInfo { get; set; } = string.Empty;
    }
}