using ResiBuy.Server.Application.Commands.CheckoutComands;
using ResiBuy.Server.Application.Queries.CheckoutQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;

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
        public async Task<IActionResult> CreateTempOrder(string userId, [FromBody] CreateTempOrderDto dto)
        {
            var result = await mediator.Send(new CreateTempOrderCommand(userId, dto));
            return Ok(result);
        }


        [HttpPut("user/{userId}")]
        public async Task<IActionResult> UpdateTempOrder(string userId, [FromBody] TempCheckoutDto dto)
        {

            var result = await mediator.Send(new UpdateTempOrderCommand(userId, dto));
            return Ok(result);
        }

        [HttpPost("user/{userId}/checkout")]
        public async Task<IActionResult> Checkout(string userId, [FromBody] Guid checkoutId)
        {
            var result = await mediator.Send(new CheckoutCommand(userId, checkoutId));
            return Ok(result);
        }
    }
}
