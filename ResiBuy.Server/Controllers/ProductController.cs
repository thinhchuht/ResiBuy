using ResiBuy.Server.Application.Commands.ProductCommands;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;
using ResiBuy.Server.Application.Queries.ProductQueries;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductDto dto)
        {
                var result = await mediator.Send(new CreateProductCommand(dto));
                return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateProductDto dto)
        {
                var result = await mediator.Send(new UpdateProductCommand(dto));
                return Ok(result);
        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
                var result = await mediator.Send(new GetProductByIdQuery(id));
                return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts([FromQuery] ProductFilter filter)
        {
                var result = await mediator.Send(new GetAllProductsQuery(filter));
                return Ok(result);

        [HttpPatch("{id}/{status}/edit")]
        public async Task<IActionResult> UpdateStatusProduct(int id, bool status)
        {
            var result = await mediator.Send(new UpdateStatusProductCommand(id, status));
            return Ok(result);

        }
    }
}