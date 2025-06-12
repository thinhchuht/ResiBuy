using ResiBuy.Server.Application.Commands.ProductCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IMediator mediator) : ControllerBase
    {
        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductCommand command)
        {
            try
            {
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
