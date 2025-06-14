using ResiBuy.Server.Services.CloudinaryServices;

namespace ResiBuy.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CloudinaryController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;

    public CloudinaryController(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm] UploadRequest uploadRequest)
    {
        try
        {
            var result = await _cloudinaryService.UploadFileAsync(uploadRequest.File, uploadRequest.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(string id)
    {
        try
        {
            await _cloudinaryService.DeleteFileAsync(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    public class UploadRequest
    {
        public string Id { get; set; } = null;
        public IFormFile File { get; set; }
    }
}