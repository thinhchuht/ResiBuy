using ResiBuy.Server.Application.Commands.ProductCommands;

namespace ResiBuy.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IMediator mediator, ResiBuyContext resiBuyContext) : ControllerBase
    {
        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateProductCommand command)
        {
            try
            {
                var result = await mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }



        [HttpGet("get-product-by-id")]
        public async Task<IActionResult> GetProductById([FromQuery] int id)
        {
            try
            {
                var result = await resiBuyContext.Products
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.Image)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.AdditionalData)
                    .FirstOrDefaultAsync(p => p.Id == id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("get-product-by-category-id")]
        public async Task<IActionResult> GetProductByCategoryId([FromQuery] Guid id, [FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                var query = resiBuyContext.Products.AsQueryable();
                var filteredQuery = query.Where(p => id == Guid.Empty || p.CategoryId == id);
                var totalCount = await filteredQuery.CountAsync();
                var items = await filteredQuery
                    .OrderBy(p => p.Sold)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.Image)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.AdditionalData)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new PagedResult<Product>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet("get-product-by-id-with-store")]
        public async Task<IActionResult> GetProductByIdWithStore([FromQuery] Guid id)
        {
            try
            {
                var result = await resiBuyContext.Products
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.Image)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.AdditionalData)
                    .Where(p => p.StoreId == id).ToListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseModel.ExceptionResponse(ex.ToString()));
            }
        }

        [HttpGet()]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                // Validate pagination parameters
                if (pageNumber < 1 || pageSize < 1)
                {
                    return BadRequest("Page number and page size must be greater than zero.");
                }

                var query = resiBuyContext.Products.AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(p => p.Sold)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.Image)
                    .Include(p => p.ProductDetails)
                    .ThenInclude(p => p.AdditionalData)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new PagedResult<Product>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                // Log the exception (logging implementation depends on your setup)
                return StatusCode(500, "An error occurred while retrieving the products.");
            }
        }
    }
}