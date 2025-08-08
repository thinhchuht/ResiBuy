namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IMediator mediator,ICodeGeneratorSerivce codeGeneratorSerivce) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(string id)
        {
            var result = await mediator.Send(new GetUserByIdQuery(id));
            return Ok(result);
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            Console.WriteLine($"In : PageNumber: {pageNumber}, PageSize: {pageSize}");
            var result = await mediator.Send(new GetAllUsersQuery(pageNumber, pageSize));
            return Ok(result);
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchAsync([FromQuery] string keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var query = new SearchUserQuery(keyword, pageNumber, pageSize);
            var result = await mediator.Send(query);
            return Ok(result);
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] RegisterDto dto)
        {
            var command = new CreatUserCustomerCommand(dto);
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("code")]
        public async Task<IActionResult> GenCodeAsync([FromBody] RegisterDto dto)
        {
            var result = await mediator.Send(new GenerateCreateUserCodeCommand(dto));
            return Ok(result);
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPost("{id}/lock-unlock")]
        public async Task<IActionResult> UpdateAsybc(string id)
        {
            var command = new LockOrUnlockUserCommand(id);
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromBody] string code, string id)
        {

            var command = new UpdateUserCommand(code, id);
            var result = await mediator.Send(command);
            return Ok(result);

        }

        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> SendUpdateUserConfirmCodeAsync([FromBody] UpdateUserDto dto, string id)
        {

            var command = new SendUpdateUserConfirmCodeCommand(dto, id);
            var result = await mediator.Send(command);
            return Ok(result);

        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/roles")]
        public async Task<IActionResult> UpdateRoleAsync(string id, [FromBody] UpdateRolesDto dto)
        {

            var command = new UpdateUserRoleCommand(id, dto);
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}/password/confirm")]
        public async Task<IActionResult> SendPasswordConfirmCode(string id, [FromBody] ChangePasswordDto dto)
        {

            var command = new SendPasswordConfirmCodeCommand(id, dto);
            var result = await mediator.Send(command);
            return Ok(result);

        }

        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(string id, [FromBody] string code)
        {

            var command = new ChangePasswordCommand(id, code);
            var result = await mediator.Send(command);
            return Ok(result);

        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/room")]
        public async Task<IActionResult> UpdateRoom(string id, [FromBody] List<Guid> newRoomIds)
        {
            var command = new ChangeRoomCommand(id, newRoomIds);
            var result = await mediator.Send(command);
            return Ok(result);
        }

        //[Authorize(Roles = Constants.AdminRole)]
        [HttpPut("{id}/name-phone")]
        public async Task<IActionResult> UpdateNameOrPhoneNumber(string id, [FromBody] ChangeNameOrPhoneDto dto)
        {

            var command = new ChangeNameOrPasswordCommand(id, dto);
            var result = await mediator.Send(command);
            return Ok(result);
        }
        [HttpPost("add-to-rooms")]
        public async Task<IActionResult> AddUserToRooms([FromBody] AddUsersToRoomCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }
        [HttpPost("remove-userroom")]
        public async Task<IActionResult> RemoveUserRoom([FromBody] RemoveUserRoomCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("stats")]
        public async Task<IActionResult> GetStatistics()
        {
            var result = await mediator.Send(new GetUserStatisticsCommand());
            return Ok(result);
        }

    }
}
