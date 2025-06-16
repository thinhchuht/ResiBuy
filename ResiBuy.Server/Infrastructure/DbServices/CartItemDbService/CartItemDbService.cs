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
    }
}
