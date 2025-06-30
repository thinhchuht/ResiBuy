namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController(IKafkaProducerService producer, ResiBuyContext dbContext) : ControllerBase
    {
        [HttpPost]
        public IActionResult Checkout ([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                var user = dbContext.Users.Include(u => u.Cart).FirstOrDefault(u => u.Id == checkoutDto.UserId);
                var cart = dbContext.Carts.FirstOrDefault(c => c.Id == user.Cart.Id);
                if (cart == null)
                    return NotFound();

                if (cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng đang được thanh toán ở nơi khác..");
                cart.IsCheckingOut = true;
                try
                {
                    dbContext.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                     throw new CustomException(ExceptionErrorCode.NotFound , "Có người khác đang thao tác với giỏ hàng này. Vui lòng thử lại.");
                }
                var message = JsonSerializer.Serialize(checkoutDto);
                producer.ProduceMessageAsync("checkout", message, "checkout-topic");
                return Ok(ResponseModel.SuccessResponse());
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
