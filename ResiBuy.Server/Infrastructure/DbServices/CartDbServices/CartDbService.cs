
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

        public async Task<List<Cart>> GetCheckingOutCartsAsync()
        {
            return await _context.Carts.Include(c => c.CartItems).Where(c => c.IsCheckingOut && c.ExpiredCheckOutTime < DateTime.UtcNow).ToListAsync();
        }

        public async Task<ResponseModel> ResetStatus(List<Guid> ids)
        {
            try
            {
                List<Cart> carts = new List<Cart>();
                foreach (var id in ids)
                {
                    var cart = await _context.Carts.FindAsync(id);
                    if (cart == null)
                        throw new CustomException(ExceptionErrorCode.NotFound, $"Cart with ID {id} not found.");
                    cart.IsCheckingOut = false;
                    carts.Add(cart);
                }
                _context.Carts.UpdateRange(carts);
                await _context.SaveChangesAsync();
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }
    }
}
