namespace ResiBuy.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IMediator mediator) : ControllerBase
    {
        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreatUserCommand command)
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
    }
}
