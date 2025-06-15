using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IMediator mediator) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(string id)
        {
            try
            {
                var result = await mediator.Send(new GetUserByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetAllUsersQuery(pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] RegisterDto dto)
        {
            try
            {
                var command = new CreatUserCommand(dto);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateAsybc([FromForm] UpdateUserDto dto)
        {
            try
            {
                var command = new UpdateUserCommand(dto);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("roles")]
        public async Task<IActionResult> UpdateAsybc(string id, List<string> roles)
        {
            try
            {
                var command = new UpdateUserRoleCommand(id, roles);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpPost("lock-unlock")]
        public async Task<IActionResult> UpdateAsybc(string id)
        {
            try
            {
                var command = new LockOrUnlockUserCommand(id);
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
