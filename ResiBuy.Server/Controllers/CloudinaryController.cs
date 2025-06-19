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

    [HttpPost("upload-batch")]
    public async Task<IActionResult> UploadBatchAsync([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
            return BadRequest("No files uploaded");

        try
        {
            var results = await _cloudinaryService.UploadBatchAsync(files);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Upload failed: {ex.Message}");
        }
    }

    [HttpDelete("{*id}")]
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
