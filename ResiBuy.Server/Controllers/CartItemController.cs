using ResiBuy.Server.Application.Commands.CartitemCommands;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartItemDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemController(IMediator mediator) : ControllerBase
    {
        [HttpPut("{id}/quantity")]
        public async Task<IActionResult> UpdateQuantity(Guid id, [FromBody] UpdateQuantityCartItemDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateCartItemQuantityCommand(id, dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
