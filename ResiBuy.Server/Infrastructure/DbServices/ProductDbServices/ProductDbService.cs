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
                //var query = _context.Products.AsQueryable();

                //var totalCount = await query.CountAsync();
                //var items = await query
                //    .OrderBy(p => p.Id)
                //    .Include(p => p.ProductImgs)
                //    .Include(p => p.CostData).ThenInclude(cd => cd.UncostData)
                //    .Include(p => p.Store)
                //    .Skip((pageNumber - 1) * pageSize)
                //    .Take(pageSize)
                //    .ToListAsync();

                return new PagedResult<Product>
                {
                    //Items = items,
                    //TotalCount = totalCount,
                    //PageNumber = pageNumber,
                    //PageSize = pageSize
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
                var product = await _context.Products
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.Image)
                    .Include(p => p.ProductDetails)
                        .ThenInclude(pd => pd.AdditionalData)
                    .FirstOrDefaultAsync(p => p.Id == id);

                return product; 
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }



    }
}
