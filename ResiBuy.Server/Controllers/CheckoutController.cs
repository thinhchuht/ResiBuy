using ResiBuy.Server.Infrastructure.DbServices.VoucherDbServices;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController(IKafkaProducerService producer, IVoucherDbService voucherDbService, ResiBuyContext dbContext) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                var user = dbContext.Users.Include(u => u.Cart).FirstOrDefault(u => u.Id == checkoutDto.UserId);
                if (user ==null) return NotFound("Không tìm thấy người dùng");
                var cart = dbContext.Carts.FirstOrDefault(c => c.Id == user.Cart.Id);
                if (cart == null)
                    return NotFound("Không tìm thấy giỏ hàng");

                if (cart.IsCheckingOut)
                throw new CustomException(ExceptionErrorCode.NotFound, "Giỏ hàng đang được thanh toán ở nơi khác..");
                var voucherIds = checkoutDto.Orders.Select(o => o.VoucherId).ToList();
                var checkVoucherRs = await voucherDbService.CheckIsActiveVouchers(voucherIds);
                if (!checkVoucherRs.IsSuccess()) return NotFound(checkVoucherRs.Message);
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
