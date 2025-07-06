
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

        public async Task<IEnumerable<CartItem>> GetMatchingCartItemsAsync(Guid cartId, IEnumerable<int> productDetailIds)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => productDetailIds.Contains(ci.ProductDetailId) && ci.CartId == cartId)
                    .ToListAsync();
                return cartItems;
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
                    .Include(ci => ci.ProductDetail)
                    .ThenInclude(p => p.Image)
                    .Include(ci => ci.ProductDetail)
                    .ThenInclude(p => p.Product)
                    .Include(ci => ci.ProductDetail)
                    .ThenInclude(p => p.AdditionalData)
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

        public async Task<ResponseModel> DeleteBatchByProductDetailIdAsync(Guid cartId, IEnumerable<int> productDetailIds)
        {
            try
            {

                //if (productDetailIds == null || !productDetailIds.Any()) throw new CustomException(ExceptionErrorCode.InvalidInput, "Không có sản phẩm nào trong giỏ hàng");
                var cartItems = await GetMatchingCartItemsAsync(cartId, productDetailIds);
                _context.CartItems.RemoveRange(cartItems);
                //await _context.SaveChangesAsync();
                return ResponseModel.SuccessResponse();
            }

            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
            }
        }

        public Task<int> GetCartItemsCountAsync(Guid cartId)
        {
            var count = _context.CartItems
                 .Where(ci => ci.CartId == cartId)
                 .CountAsync();
            return count;
        }

        public async Task<IEnumerable<CartItem>> GetBatchCartItemsAsync(List<Guid> ids)
        {
            return await _context.CartItems
                .Where(ci => ids.Contains(ci.Id))
                .Include(ci => ci.ProductDetail)
                    .ThenInclude(pd => pd.Image)
                .Include(ci => ci.ProductDetail)
                    .ThenInclude(pd => pd.Product)
                .Include(ci => ci.ProductDetail)
                    .ThenInclude(pd => pd.AdditionalData)
                .Include(ci => ci.Cart)
                .ToListAsync();
        }
    }
}
