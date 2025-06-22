
namespace ResiBuy.Server.Infrastructure.DbServices.ImageServices
{
    public class ImageDbService : BaseDbService<Image>, IImageDbService
    {
        private readonly ResiBuyContext _context;
        public ImageDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }

        public async Task<Image> GetImageByIdAsync(string id)
        {
            return await _context.Images.FindAsync(id);
        }
    }
}
