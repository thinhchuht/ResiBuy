namespace ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices
{
    public class ProductDetailDbService : BaseDbService<ProductDetail>, IProductDetailDbService
    {
        private readonly ResiBuyContext _context;
        public ProductDetailDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }
        public async Task<ProductDetail> GetByIdAsync(int id)
        {
            try
            {

                var productDetail = await _context.ProductDetails.FirstOrDefaultAsync(p => p.Id == id);
                return productDetail;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}
