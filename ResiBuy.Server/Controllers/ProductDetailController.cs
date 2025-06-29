using ResiBuy.Server.Application.Commands.ProductDetailCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductDetailController(IMediator mediator) : ControllerBase
    {
        [HttpPatch("{id}/{status}/edit")]
        public async Task<IActionResult> UpdateStatusProductDetail(int id, bool status)
        {
            var result = await mediator.Send(new UpdateStatusProductDetailCommand(id, status));
            return Ok(result);
        }
    }
}
