using Microsoft.AspNetCore.Mvc;
using ResiBuy.Server.Application.Commands.ImageCommand;
using ResiBuy.Server.Application.Queries.ImageQueries;

namespace ResiBuy.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ImageController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllImages(CancellationToken cancellationToken)
        {
            try
            {
                var query = new GetAllImagesQuery();
                var result = await _mediator.Send(query, cancellationToken);
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateImage(
            [FromBody] CreateImageCommand command,
            CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { Success = false, Message = "Dữ liệu đầu vào không hợp lệ" });

                var result = await _mediator.Send(command, cancellationToken);
                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        result.Id,
                        result.Url,
                        result.ThumbUrl,
                        result.Name
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(string id, CancellationToken cancellationToken)
        {
            try
            {
                var command = new DeleteImageCommand(id);
                await _mediator.Send(command, cancellationToken);
                return Ok(new { Success = true, Message = "Xóa ảnh thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }
    }
}
