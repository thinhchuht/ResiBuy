using ResiBuy.Server.Application.Commands.ImportCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ImportController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ImportController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<ResponseModel>> Upload([FromForm] ImportAreaBuildingRoomExcelCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (CustomException ex)
            {
                return BadRequest(ResponseModel.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ResponseModel.ExceptionResponse(ex.Message));
            }
        }

        [HttpPost("confirm")]
        public async Task<ActionResult<ResponseModel>> Confirm([FromBody] ConfirmImportCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (CustomException ex)
            {
                return BadRequest(ResponseModel.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ResponseModel.ExceptionResponse(ex.Message));
            }
        }
    }
}
