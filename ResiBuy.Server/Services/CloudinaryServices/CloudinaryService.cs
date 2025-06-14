using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace ResiBuy.Server.Services.CloudinaryServices;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(CloudinarySetting config)
    {
        _cloudinary = config.GetCloudinary();
    }

    public async Task<CloudinaryResult> UploadFileAsync(IFormFile file, string existingPublicId = null)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");
        using var stream = file.OpenReadStream();

        const string folder = "resibuy";
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = string.IsNullOrEmpty(existingPublicId) ? folder : null,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = !string.IsNullOrEmpty(existingPublicId),
            Invalidate = !string.IsNullOrEmpty(existingPublicId),
            Transformation = null
        };

        if (!string.IsNullOrEmpty(existingPublicId))
        {
            uploadParams.PublicId = existingPublicId;
        }

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        var fullPublicId = $"{uploadResult.PublicId}";
        var thumbnailUrl = _cloudinary.Api.UrlImgUp
            .Transform(new Transformation().Width(300).Height(300).Crop("fill"))
            .BuildUrl(fullPublicId);

        return new CloudinaryResult(
            uploadResult.SecureUrl.ToString(),
            uploadResult.PublicId,
            thumbnailUrl,
            file.FileName
        );
    }

    public async Task<List<CloudinaryResult>> UploadBatchAsync(List<IFormFile> files)
    {
        if (files == null || !files.Any())
            throw new ArgumentException("Files list is empty");

        var uploadTasks = files.Select(file => UploadFileAsync(file));
        var results = await Task.WhenAll(uploadTasks);
        return results.ToList();
    }

    public async Task<ResponseModel> DeleteFileAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Result == "ok")
        {
            return ResponseModel.SuccessResponse();
        }
        throw new CustomException(ExceptionErrorCode.DeleteFailed, "Failed to delete imgae");
    }
}