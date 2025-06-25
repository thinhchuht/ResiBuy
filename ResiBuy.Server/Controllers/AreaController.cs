using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;
using ResiBuy.Server.Application.Commands.CategoryCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AreaController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            try
            {
                var result = await mediator.Send(new GetAllAreasQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
        [HttpGet("count")]
        public async Task<IActionResult> Count()
        {
            var result = await mediator.Send(new CountAreaQuery());
            return Ok(result);
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateAreaCommand command)
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
        [HttpPut("update")]
        public async Task<IActionResult> UpdateAreaAsync([FromBody] UpdateAreaDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateAreaCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }
        [HttpPut("updatestatus")]
        public async Task<IActionResult> UpdateAreaStatusAsync([FromBody] UpdateAreaStatusCommand command)
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
    }
}
