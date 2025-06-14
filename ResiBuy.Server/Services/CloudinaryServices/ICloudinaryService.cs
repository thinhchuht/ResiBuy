using Microsoft.AspNetCore.Http;
using static ResiBuy.Server.Controllers.CloudinaryController;
using ResiBuy.Server.Controllers;

namespace ResiBuy.Server.Services.CloudinaryServices
{
    public interface ICloudinaryService
    {
        Task<ResponseModel> DeleteFileAsync(string publicId);
        Task<CloudinaryResult> UploadFileAsync(IFormFile file, string existingPublicId = null);
        Task<List<CloudinaryResult>> UploadBatchAsync(List<IFormFile> files);
    }
}