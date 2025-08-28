using ResiBuy.Server.Application.Queries.StatisticsAdminQueries;


namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]

    public class StatisticsController : Controller
    {
        private readonly IMediator _mediator;

        public StatisticsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
        {
            if (startTime == default || endTime == default)
                return BadRequest("Vui lòng truyền startTime và endTime hợp lệ.");
            var result = await _mediator.Send(new GetOrderStatisticsQuery(startTime, endTime));
            return Ok(result);
        }
        [HttpGet("top-and-category-statistics")]
        public async Task<IActionResult> GetTopAndCategoryStatistics([FromQuery] DateTime startTime, [FromQuery] DateTime endTime)
        {
            if (startTime == default || endTime == default)
                return BadRequest("Vui lòng truyền startTime và endTime hợp lệ.");

            var (topStatistics, categoryPercentages) = await _mediator.Send(new GetTopAndCategoryStatisticsQuery(startTime, endTime));

            return Ok(new
            {
                TopStatistics = topStatistics,
                CategoryPercentages = categoryPercentages
            });
        }

    }
}