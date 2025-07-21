
namespace ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices
{
    public class ProductDetailDbService : BaseDbService<ProductDetail>, IProductDetailDbService
    {
        private readonly ResiBuyContext _context;
        public ProductDetailDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }

        public async Task<ResponseModel> CheckIsOutOfStock(List<int> ids)
        {
            var outOfStockProduct = await _context.ProductDetails.Include(pd => pd.Product)
                .Where(p => ids.Contains(p.Id) && (p.IsOutOfStock || p.Quantity <= 0))
                .FirstOrDefaultAsync();

            if (outOfStockProduct != null)
            {
                throw new CustomException(
                    ExceptionErrorCode.NotFound,
                    $"Sản phẩm '{outOfStockProduct.Product.Name}' đã hết hàng"
                );
            }

            return ResponseModel.SuccessResponse();
        }

        public async Task<List<ProductDetail>> GetBatchAsync(List<int> ids)
        {
            return await _context.ProductDetails.Include(pd => pd.Product).Include(pd => pd.Product.Store)
                .Where(pd => ids.Contains(pd.Id))
                .ToListAsync();
        }

        public async Task<ProductDetail> GetByIdAsync(int id)
        {
            try
            {

                var productDetail = await _context.ProductDetails.Include(pd => pd.Product).Include(pd => pd.Image).Include(pd => pd.AdditionalData).FirstOrDefaultAsync(p => p.Id == id);
                return productDetail;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<ResponseModel> UpdateQuantityOutOfStock(int pdId, int quantity)
        {
            var pd = await _context.ProductDetails.Include(pd => pd.Product).FirstOrDefaultAsync(p => p.Id == pdId);

            return ResponseModel.SuccessResponse();
        }

        public async Task<List<ProductDetail>> GetByProductIdAsync(int productId)
        {
            return await _context.ProductDetails.Where(pd => pd.ProductId == productId).ToListAsync();
        }
    }
}
