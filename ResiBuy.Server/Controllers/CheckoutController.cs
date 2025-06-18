namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController(IKafkaProducerService producer) : ControllerBase
    {
        [HttpPost("checkout")]
        public IActionResult Checkout ([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                var message = JsonSerializer.Serialize(checkoutDto);
                producer.ProduceMessageAsync("checkout", message, "checkout-topic");
                return Ok(ResponseModel.SuccessResponse());
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
