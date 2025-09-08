using Microsoft.AspNetCore.Mvc;
using ResiBuy.Server.Application.Commands.PromotionCommands;
using ResiBuy.Server.Application.Commands.PromotionCommands.DTOs;
using ResiBuy.Server.Application.Queries.PromotionQueries;
using ResiBuy.Server.Application.Queries.PromotionQueries.DTOs;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class PromotionController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] GetPromotionDto dto)
        {
            try
            {
                var result = await mediator.Send(new GetAllPromotionQuery(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await mediator.Send(new GetPromotionByIdQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreatePromotionDto dto)
        {
            try
            {
                var result = await mediator.Send(new CreatePromotionCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromBody] UpdatePromotionDto dto)
        {
            try
            {
                var result = await mediator.Send(new UpdatePromotionCommand(dto));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPut("updatestatus")]
        public async Task<IActionResult> UpdateStatusAsync([FromBody] UpdatePromotionStatusCommand command)
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
    }
}
