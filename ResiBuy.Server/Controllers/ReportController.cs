using ResiBuy.Server.Application.Commands.ReportCommands;
using ResiBuy.Server.Application.Queries.ReportQueries;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController(IMediator mediator) : ControllerBase
    {

        [HttpGet]
        public async Task<IActionResult> GetAllReport([FromQuery] GetReportDto dto)
        {
            var result = await mediator.Send(new GetAllReportQuery(dto));
            return Ok(result);
        }

        [HttpGet("count")]
        public async Task<IActionResult> CountReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var result = await mediator.Send(new ReportStatusCountQuery(startDate, endDate));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(Guid id)
        {
            var result = await mediator.Send(new GetReportByIdQuery(id));
            return Ok(result);

        }

        [HttpGet("order/{id}")]
        public async Task<IActionResult> GetReportByOrderId(Guid id)
        {
            var result = await mediator.Send(new GetReportByOrderIdQuery(id));
            return Ok(result);

        }
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            var result = await mediator.Send(new CreateReportCommand(dto));
            return Ok(result);
        }

        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> UpdateReport(Guid id, bool isAddReportTarget)
        {
            var result = await mediator.Send(new ResolveReportCommand(id, isAddReportTarget));
            return Ok(result);
        }
    }
}
