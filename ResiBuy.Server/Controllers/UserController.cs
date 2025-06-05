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

        [Authorize(Roles = "ADMIN")]
        [HttpGet]
        public async Task<IActionResult> GetllAsync()
        {
            try
            {
                var result = await mediator.Send(new GetAllUsersQuery());
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

    }
}
