using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;
using ResiBuy.Server.Application.Commands.BuildingCommands.DTOs;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            try
            {
                var result = await mediator.Send(new GetAllBuildingsQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("area/{id}")]
        public async Task<IActionResult> GetByAreaIdAsync(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetByAreaIdQuery(id));
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
                var result = await mediator.Send(new CountBuildingsQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateBuildingCommand command)
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
        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdateBuildingDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdateBuildingCommand(dto)); // 👈 Sửa ở đây
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        [HttpPut("updatestatus")]
        public async Task<IActionResult> UpdateStatusAsync([FromBody] UpdateBuildingStatusCommand command)
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
        public async Task<IActionResult> GetBuildingById(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetBuildingByIdQuery(id));
                return Ok(result);
            }
           
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


    }
}
