
using ResiBuy.Server.Application.Commands.CategoryCommands;
using ResiBuy.Server.Application.Commands.CategoryCommands.DTOs;
using ResiBuy.Server.Application.Queries.CategoryQueries;


namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController(IMediator mediator, ResiBuyContext context) : ControllerBase
    {

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var result = await mediator.Send(new CreateCategoryCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateCategoryDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateCategoryCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetCategoieByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategory()
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

    }
}
