
namespace ResiBuy.Server.Infrastructure.DbServices.PromotionDbService
{
    public class PromotionDbService : BaseDbService<Promotion>, IPromotionDbService
    {
        private readonly ResiBuyContext _context;
        public PromotionDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }
        public async Task<List<Promotion>> GetAllPromotionsAsync(string keyword, bool? isActive, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Promotions.AsQueryable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(p => p.Name.Contains(keyword));
            }

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(p => p.StartDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.EndDate <= endDate.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<List<Product>> GetProductsByPromotionIdAsync(int promotionId)
        {
            var products = await _context.Products.Where(p => p.PromotionId == promotionId).ToListAsync();
            return products;
        }

        public async Task<Promotion> GetPromotionByIdAsync(int id)
        {
            return await _context.Promotions.FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
