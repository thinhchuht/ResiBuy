namespace ResiBuy.Server.Infrastructure.DbServices.CartItemDbService
{
    public class CartItemDbService : BaseDbService<CartItem>, ICartItemDbService
    {
        private readonly ResiBuyContext _context;

        public CartItemDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<ResponseModel> DeleteBatchAsync(IEnumerable<Guid> cartItemIds)
        {
            try
            {
                if (cartItemIds == null || !cartItemIds.Any()) throw new CustomException(ExceptionErrorCode.InvalidInput, "Không có sản phẩm nào trong giỏ hàng");
                var cartItems = await _context.CartItems
                    .Where(ci => cartItemIds.Contains(ci.Id))
                    .ToListAsync();

                if (!cartItems.Any())
                    throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy sản phẩm trong giỏ hàng");

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();
                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }

        public async Task<CartItem> GetMatchingCartItemsAsync(Guid cartId, Guid productId, Guid costDataId, List<Guid> uncostDataIds)
        {
            try
            {
                return await _context.CartItems
                    .Include(ci => ci.CartItemUncosts)
                    .Where(ci =>
                        ci.ProductId == productId &&
                        ci.CartId == cartId &&
                        ci.CostDataId == costDataId &&
                        ci.CartItemUncosts.Select(u => u.UncostDataId).OrderBy(x => x)
                            .SequenceEqual(uncostDataIds.OrderBy(x => x))
                    )
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }

        public async Task<PagedResult<CartItem>> GetCartItemsByCartIdAsync(Guid cartId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.CartItems
                    .Where(ci => ci.CartId == cartId)
                    .Include(ci => ci.Product)
                        .ThenInclude(p => p.ProductImgs)
                    .Include(ci => ci.Product)
                        .ThenInclude(p => p.CostData)
                    .AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(ci => ci.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<CartItem>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
