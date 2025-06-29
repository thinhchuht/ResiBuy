namespace ResiBuy.Server.Infrastructure.DbServices.ImageServices
{
    public interface IImageDbService : IBaseDbService<Image>
    {
        Task<Image> GetImageByIdAsync(string id);

        Task DeleteAsync(Image image);
    }
}