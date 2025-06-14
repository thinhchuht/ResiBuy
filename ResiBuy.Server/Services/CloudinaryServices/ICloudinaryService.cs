namespace ResiBuy.Server.Services.CloudinaryServices
{
    public interface ICloudinaryService
    {
        Task<ResponseModel> DeleteFileAsync(string publicId);
        Task<CloudinaryResult> UploadFileAsync(IFormFile file, string existingPublicId = null);
    }
}