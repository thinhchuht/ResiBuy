using ResiBuy.Server.Application.Commands.ReviewCommands;
using ResiBuy.Server.Application.Queries.ReviewQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReviewDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllReviews([FromQuery] GetAllReviewDto dto)
        {
            var result = await mediator.Send(new GetAllReviewsQuery(dto));
            return Ok(result);

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAllReviews(Guid id)
        {
            var result = await mediator.Send(new GetReviewByIdQuery(id));
            return Ok(result);

        }

        [HttpGet("product/{id}/avg-rate")]
        public async Task<IActionResult> GetProductAvarageRate(int id)
        {
            var result = await mediator.Send(new GetAverageRateQuery(id));
            return Ok(result);

        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var result = await mediator.Send(new CreateReviewCommand(dto));
            return Ok(result);
        }
    }
}
