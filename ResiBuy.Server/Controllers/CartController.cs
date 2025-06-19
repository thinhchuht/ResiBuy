using ResiBuy.Server.Application.Commands.CartCommands;
using ResiBuy.Server.Application.Queries.CartQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController(IMediator mediator) : Controller
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetCartByIdQuery(id, pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddToCart(Guid id, [FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var result = await mediator.Send(new AddToCartCommand(id, addToCartDto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpDelete("{id}/items")]
        public async Task<IActionResult> DeleteCartItems(Guid id,[FromBody] DeleteCartItemsDto deleteCartItemsDto)
        {
            try
            {
                var result = await mediator.Send(new DeleteCartItemsCommand(id, deleteCartItemsDto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
