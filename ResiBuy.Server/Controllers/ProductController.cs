using ResiBuy.Server.Application.Commands.ProductCommands;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs;
using ResiBuy.Server.Application.Queries.ProductQueries;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IMediator mediator) : ControllerBase
    {
        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductDto dto)
        {
            try
            {
                var result = await mediator.Send(new CreateProductCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }





        [HttpGet("get-product-by-id")]
        public async Task<IActionResult> GetProductById([FromQuery] int id)
        {
            try
            {
                var result = await mediator.Send(new GetProductByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("get-product-by-id-with-store")]
        public async Task<IActionResult> GetProductByIdWithStore([FromQuery] int id)
        {
            try
            {
                var result = await mediator.Send(new GetProductByIdWithStoreAsync(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("get-all-products")]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                var result = await mediator.Send(new GetPagedProductsAsync(pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}