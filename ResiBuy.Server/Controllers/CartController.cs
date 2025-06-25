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

        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetStatusById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetCartStatusByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("checking-out")]
        public async Task<IActionResult> GetCheckingOutCarts()
        {
            try
            {
                var result = await mediator.Send(new GetChekingOutCartsQuery());
                return Ok(result.Data);
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

        [HttpPost("reset-status")]
        public async Task<IActionResult> ResetStatus( [FromBody] List<Guid> ids)
        {
            try
            {
                var result = await mediator.Send(new ResetStatusCommand(ids));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpDelete("items")]
        public async Task<IActionResult> DeleteCartItems([FromBody] DeleteCartItemsDto deleteCartItemsDto)
        {
            try
            {
                var result = await mediator.Send(new DeleteCartItemsCommand( deleteCartItemsDto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("{cartId}/items/count")]
        public async Task<IActionResult> CountCartItems(Guid cartId)
        {
            try
            {
                var result = await mediator.Send(new GetCartItemsCountQuery(cartId));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
