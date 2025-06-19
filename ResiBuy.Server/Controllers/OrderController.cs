using ResiBuy.Server.Application.Commands.OrderCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CheckoutDto checkoutDto)
        {
            try
            {
                try
                {
                    var result = await mediator.Send(new CreateOrderCommand(checkoutDto));
                    return Ok(result);
                }
                catch (Exception ex)
                {
                    return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
