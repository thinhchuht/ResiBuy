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

        //[Authorize(Roles = Constants.AdminRole)]
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


        [HttpGet("search")]
        public async Task<IActionResult> SearchAsync([FromQuery] string keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = new SearchUserQuery(keyword, pageNumber, pageSize);
                var result = await mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        //[Authorize(Roles = Constants.AdminRole)]
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

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPost("{id}/lock-unlock")]
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromForm] UpdateUserDto dto, string id)
        {
            try
            {
                var command = new UpdateUserCommand(dto, id);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/roles")]
        public async Task<IActionResult> UpdateRoleAsync(string id, [FromBody] List<string> roles)
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

        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(string id, [FromBody] ChangePasswordDto dto)
        {
            try
            {
                var command = new ChangePasswordCommand(id, dto.OldPassword, dto.NewPassword);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/room")]
        public async Task<IActionResult> UpdateRoom(string id, [FromBody] List<Guid> newRoomIds)
        {
            try
            {
                var command = new ChangeRoomCommand(id, newRoomIds);
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/name-phone")]
        public async Task<IActionResult> UpdateNameOrPhoneNumber(string id, [FromBody] ChangeNameOrPhoneDto dto)
        {
            try
            {
                var command = new ChangeNameOrPasswordCommand(id, dto);
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
