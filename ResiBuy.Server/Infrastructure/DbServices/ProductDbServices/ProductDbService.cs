using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.ProductDbServices
{
    public class ProductDbService : BaseDbService<Product>, IProductDbService
    {
        private readonly ResiBuyContext _context;
        public ProductDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }

        public async Task<PagedResult<Product>> GetAllProducts(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Products.AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(p => p.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Product>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
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
                var product = await _context.Products.FirstOrDefaultAsync(a => a.Id == id);
                if (product == null)
                {
                    return null;
                }
                return product;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Product> GetProductByIdWithStoreAsync(int id)
        {
            try
            {
                var product = await _context.Products.Include(p => p.Store).FirstOrDefaultAsync(a => a.Id == id);
                if (product == null)
                {
                    return null;
                }
                return product;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}
