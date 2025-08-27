using ResiBuy.Server.Application.Commands.RoomCommands.DTOs;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] GetPagedRoomsQuery query)
        {
            try
            {
                var result = await mediator.Send(query);
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
        public async Task<IActionResult> GetByBuildingPaged(
           Guid id,
           [FromQuery] int pageNumber = 1,
           [FromQuery] int pageSize = 10,
           [FromQuery] bool? isActive = null,
           [FromQuery] bool? noUsers = null)
        {
            var result = await mediator.Send(new GetRoomsByBuildingIdPagedQuery(
                id,
                pageNumber,
                pageSize,
                isActive,
                noUsers
            ));

            return Ok(result);
        }


        //[Authorize]

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
        //[Authorize]

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
        //[Authorize]

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateRoomDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateRoomCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        //[Authorize]

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
        //[Authorize]

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
        //[Authorize]

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

        [HttpGet("search")]
        public async Task<IActionResult> SearchRoomsByName([FromQuery] string keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            
                var result = await mediator.Send(new GetRoomsByNameQuery(keyword, pageNumber, pageSize));
                return Ok(result);
            
        }

        [HttpGet("searchrom/building")]
        public async Task<IActionResult> SearchRoomsByNameAndBuilding([FromQuery] Guid buildingId, [FromQuery] string keyword, [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = null,[FromQuery] bool? noUsers = null)
        {

            var result = await mediator.Send(new GetRoomsByNameAndBuildingQuery(
                buildingId, keyword, pageNumber, pageSize, isActive, noUsers));
                return Ok(result);
          
        }
        [HttpGet("status")]
        public async Task<IActionResult> GetRoomsByStatus([FromQuery] bool isActive, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetRoomsByStatusQuery(isActive, pageNumber, pageSize));
                return Ok(result);
            }
            
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("{buildingId}/status")]
        public async Task<IActionResult> GetRoomsByStatusAndBuilding(Guid buildingId, [FromQuery] bool isActive, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetRoomsByStatusAndBuildingQuery(buildingId, isActive, pageNumber, pageSize));
                return Ok(result);
            }
           
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("count/active/{buildingId}")]
        public async Task<IActionResult> CountActiveRooms(Guid buildingId)
        {
            try
            {
                var result = await mediator.Send(new CountActiveRoomsByBuildingIdQuery(buildingId));
                return Ok(result);
            }
          
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("count/inactive/{buildingId}")]
        public async Task<IActionResult> CountInactiveRooms(Guid buildingId)
        {
            try
            {
                var result = await mediator.Send(new CountInactiveRoomsByBuildingIdQuery(buildingId));
                return Ok(result);
            }
           
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetRoomsByUserId(string userId)
        {
            var result = await mediator.Send(new GetRoomsByUserIdQuery(userId));
            return Ok(result);
        }

    }

}
