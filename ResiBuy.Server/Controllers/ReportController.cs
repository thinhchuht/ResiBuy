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
        public async Task<IActionResult> GetAllReport(GetReportDto dto)
        {
            try
            {
                var result = await mediator.Send(new GetAllReportQuery(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetReportByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            try
            {
                var result = await mediator.Send(new CreateReportCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
    }
}
