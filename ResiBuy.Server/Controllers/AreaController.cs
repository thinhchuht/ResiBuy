using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AreaController(IMediator mediator) : ControllerBase
    {
        //[Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(bool getActive = true)
        {
            try
            {
                var result = await mediator.Send(new GetAllAreasQuery(getActive));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("count")]
        public async Task<IActionResult> Count()
        {
            try
            {
                var result = await mediator.Send(new CountAreaQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CommanAreaDto command)
        {
            try
            {
                var result = await mediator.Send(new CreateAreaCommand(command));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateAreaAsync([FromBody] UpdateAreaDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateAreaCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
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
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAreaById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetAreaByIdQuery(id));
                return Ok(result);
            }

            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
