namespace ResiBuy.Server.Infrastructure.DbServices.CartDbService
{
    public class CartDbService : BaseDbService<Cart>, ICartDbService
    {
        private readonly ResiBuyContext _context;
        public CartDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Cart> GetByIdAsync(Guid id)
        {
            return await _context.Carts.Include(c => c.CartItems).FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
