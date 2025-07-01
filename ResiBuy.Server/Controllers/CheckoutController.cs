using ResiBuy.Server.Application.Commands.CheckoutComands;
using ResiBuy.Server.Application.Queries.CheckoutQueries;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController(IMediator mediator) : ControllerBase
    {

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetTempOrdersByIds(string userId, Guid id)
        {
            var result = await mediator.Send(new GetTempOrderByIdsQuery(userId, id));
            return Ok(result);
        }

        [HttpPost("user/{userId}")]
        public async Task<IActionResult> CreateTempOrder(string userId, [FromBody] List<CreateTempCartItemDto> cartItems)
        {
            var result = await mediator.Send(new CreateTempOrderCommand(userId, cartItems));
            return Ok(result);
        }


        [HttpPut("user/{userId}")]
        public async Task<IActionResult> UpdateTempOrder(string userId, [FromBody] TempCheckoutDto dto)
        {

            var result = await mediator.Send(new UpdateTempOrderCommand(userId, dto));
            return Ok(result);
        }

        //[HttpPut("user/{userId}/apply-voucher")]
        //public async Task<IActionResult> ApplyVoucherTempOrder(string userId, [FromBody] TempCheckoutDto dto)
        //{

        //    var result = await mediator.Send(new ApplyVoucherCommand(userId, dto));
        //    return Ok(result);
        //}



        [HttpPost("user/{userId}/checkout")]
        public async Task<IActionResult> Checkout(string userId, [FromBody] Guid checkoutId)
        {
            var result = await mediator.Send(new CheckoutCommand(userId, checkoutId));
            return Ok(result);
        }
    }
}
