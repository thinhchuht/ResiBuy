using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.EntityFrameworkCore;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public class ProductDbService : BaseDbService<Product>, IProductDbService
    {
        private readonly ResiBuyContext _context;
        public ProductDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }

        public IQueryable<Product> GetAllProductsQuery()
        {
            try {    
                return _context.Products
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                    .AsQueryable();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }


        public async Task<Product> GetByIdAsync(int id)
        {
            try
            {

                var product = await _context.Products
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                     .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);

                return product; 
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Product> GetByNameAsync(Guid storeId, string name)
        {
            try
            {

                var product = await _context.Products.FirstOrDefaultAsync(p => p.StoreId == storeId && p.Name.ToLower() == name.ToLower());
                return product;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<bool> ExistsByNameAsync(Guid storeId, string name, int excludeProductId)
        {
            return await _context.Products
                .AnyAsync(p => p.StoreId == storeId
                            && p.Name.ToLower() == name.ToLower()
                            && p.Id != excludeProductId);
        }

    }
}
