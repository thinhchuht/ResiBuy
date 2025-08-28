using ResiBuy.Server.Application.Commands.ReportCommands;
using ResiBuy.Server.Application.Queries.ReportQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController(IMediator mediator) : ControllerBase
    {
        //[Authorize]

        [HttpGet]
        public async Task<IActionResult> GetAllReport([FromQuery] GetReportDto dto)
        {
            var result = await mediator.Send(new GetAllReportQuery(dto));
            return Ok(result);
        }
        //[Authorize]

        [HttpGet("count")]
        public async Task<IActionResult> CountReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var result = await mediator.Send(new ReportStatusCountQuery(startDate, endDate));
            return Ok(result);
        }
        //[Authorize]

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(Guid id)
        {
            var result = await mediator.Send(new GetReportByIdQuery(id));
            return Ok(result);

        }
        //[Authorize]

        [HttpGet("order/{id}")]
        public async Task<IActionResult> GetReportByOrderId(Guid id)
        {
            var result = await mediator.Send(new GetReportByOrderIdQuery(id));
            return Ok(result);

        }
        //[Authorize]

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            var result = await mediator.Send(new CreateReportCommand(dto));
            return Ok(result);
        }
        //[Authorize]

        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> UpdateReport(Guid id, [FromBody] bool isAddReportTarget)
        {
            var result = await mediator.Send(new ResolveReportCommand(id, isAddReportTarget));
            return Ok(result);
        }
    }
}
