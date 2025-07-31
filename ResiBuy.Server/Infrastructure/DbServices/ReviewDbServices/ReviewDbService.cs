namespace ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices
{
    public class ReviewDbService : BaseDbService<Review>, IReviewDbService
    {
        private readonly ResiBuyContext _context;
        public ReviewDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CheckIfUserReviewed(string userId, int productDetailId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductDetailId == productDetailId);
        }

        public async Task<PagedResult<Review>> GetAllReviewsAsync(int productId, int rate = 0, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Reviews
                .Include(r => r.User)
                .Include(r => r.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(r => r.ProductDetail).ThenInclude(pd => pd.AdditionalData)
                .AsQueryable();

            query = query.Where(r => r.ProductDetail.Product.Id == productId);

            if (rate != 0)
            {
                query = query.Where(r => r.Rate == rate);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Review>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<List<Review>> GetReviewsByProductIdAsync(int productId)
        {
            return await _context.Products
                .Where(p => p.Id == productId)
                .SelectMany(p => p.ProductDetails)
                .SelectMany(pd => pd.Reviews)
                .ToListAsync();
        }

        public async Task<Review> GetReviewById(Guid id)
        {
            return await _context.Reviews.Include(r => r.User)
                .Include(r => r.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(r => r.ProductDetail).ThenInclude(pd => pd.AdditionalData).FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
