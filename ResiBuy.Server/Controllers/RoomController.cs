namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetPagedRoomsQuery(pageNumber, pageSize));
                return Ok(result);
            }
            catch (CustomException ex)
            {
                return StatusCode(ex.HttpStatus, ResponseModel.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("building/{id}")]
        public async Task<IActionResult> GetByBuildingPaged(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetRoomsByBuildingIdPagedQuery(id, pageNumber, pageSize));
            return Ok(result);
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateRoomCommand command)
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
        [HttpGet("detail/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetRoomByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateRoomCommand command)
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
        [HttpPut("updateStatus")]
        public async Task<IActionResult> UpdateRoomStatusAsync([FromBody] UpdateRoomStatusCommand command)
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
        [HttpGet("count")]
        public async Task<IActionResult> CountRoomsAsync()
        {
            try
            {
                var result = await mediator.Send(new CountRoomsQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("countroom/building/{buildingId}")]
        public async Task<IActionResult> CountRoomsByBuildingIdAsync(Guid buildingId)
        {
            try
            {
                var result = await mediator.Send(new CountRoomsByBuildingIdQuery(buildingId));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}
