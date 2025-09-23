namespace ResiBuy.Server.Application.Queries.ImageQueries
{
    public record GetAllImagesQuery : IRequest<List<object>>;

    public class GetAllImagesQueryHandler : IRequestHandler<GetAllImagesQuery, List<object>>
    {
        private readonly ResiBuyContext _context;

        public GetAllImagesQueryHandler(ResiBuyContext context)
        {
            _context = context;
        }

        public async Task<List<object>> Handle(GetAllImagesQuery request, CancellationToken cancellationToken)
        {
            // Lấy ảnh thỏa mãn: (ProductDetailId = null AND UserId = null AND CategoryId = null) OR ProductDetailId != null
            var images = await _context.Images
                .Include(i => i.ProductDetail)
                .ThenInclude(pd => pd!.Product) // Include Product nếu cần thông tin bổ sung
                .Where(i => (i.ProductDetailId == null && i.UserId == null && i.CategoryId == null) || i.ProductDetailId != null)
                .Select(i => new
                {
                    i.Id,
                    i.Url,
                    i.ThumbUrl,
                    i.Name,
                    ProductDetail = i.ProductDetail != null ? new
                    {
                        i.ProductDetail.Id,
                        i.ProductDetail.ProductId,

                        ProductName = i.ProductDetail.Product.Name
                    } : null
                })
                .ToListAsync(cancellationToken);

            return images.Cast<object>().ToList();
        }
    }
}