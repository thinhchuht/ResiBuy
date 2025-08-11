
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
            var result = await mediator.Send(new CreateCategoryCommand(dto));
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateCategoryDto dto)
        {
                var result = await mediator.Send(new UpdateCategoryCommand(dto));
                return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
                var result = await mediator.Send(new GetCategoieByIdQuery(id));
                return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategory(bool status = true)
        {
                var result = await mediator.Send(new GetAllCategoriesQuery(status));
                return Ok(result);
        }
        [HttpGet("countAll")]
        public async Task<IActionResult> CountAllCategories()
        {

            var result = await mediator.Send(new CountAllCategoriesQuery());
            return Ok(result);
        }
        [HttpGet("countProducts/{categoryId}")]
        public async Task<IActionResult> CountProductsByCategoryId(Guid categoryId)
        {
           
                var result = await mediator.Send(new CountProductsByCategoryIdQuery(categoryId));
                return Ok(result);
        }
    }
}
