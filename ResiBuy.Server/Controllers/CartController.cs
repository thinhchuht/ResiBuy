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
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetCartByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> AddToCart(Guid id, AddToCartDto addToCartDto)
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> AddToCart(Guid id, AddToCartDto addToCartDto)
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
    }
}
