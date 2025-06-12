using ResiBuy.Server.Application.Commands.CategoryCommands;
using ResiBuy.Server.Application.Queries.CategoryQueries;
using ResiBuy.Server.Infrastructure.Filter;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController(IMediator mediator) : ControllerBase
    {

        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateCategoryCommand command)
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

        [HttpGet("get-all-category")]
        public async Task<IActionResult> GetAllAsync()
        {
            try
            {
                var result = await mediator.Send(new GetAllCategoriesQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("get-category-with-products")]
        public async Task<IActionResult> GetAllAsync([FromQuery] Guid categoryId, [FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                var result = await mediator.Send(new GetPagedProductsByCategoryIdAsync(categoryId, pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
