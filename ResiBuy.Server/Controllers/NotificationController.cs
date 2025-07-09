using ResiBuy.Server.Application.Commands.NotificationCommands;
using ResiBuy.Server.Application.Queries.NotificationQueries;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController(IMediator mediator) : ControllerBase
    {
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetAllAsync(string id, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var result = await mediator.Send(new GetAllNotificationsQuery(id, pageNumber, pageSize));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpGet("user/{id}/count")]
        public async Task<IActionResult> CountUnreadAsync(string id)
        {
            try
            {
                var result = await mediator.Send(new CountUnreadNotificationQuery(id));
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ReadAsync(Guid id, string userId)
        {
            var result = await mediator.Send(new ReadNotificationCommand(id, userId));
            return Ok(result);
        }

    }
}
