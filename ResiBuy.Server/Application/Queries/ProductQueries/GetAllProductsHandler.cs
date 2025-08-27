using ResiBuy.Server.Application.Queries.ProductQueries.DTOs;
using ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetAllProductsQuery(ProductFilter Filter) : IRequest<PagedResult<ProductQueriesDto>>;

    public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, PagedResult<ProductQueriesDto>>
    {
        private readonly IProductDbService _productDbService;
        private readonly IReviewDbService _reviewDbService;

        public GetAllProductsHandler(IProductDbService productDbService, IReviewDbService reviewDbService)
        {
            _productDbService = productDbService;
            _reviewDbService = reviewDbService;
        }

        public async Task<PagedResult<ProductQueriesDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
        {
            var filter = request.Filter;

            var query = _productDbService.GetAllProductsQuery();

            if (!string.IsNullOrWhiteSpace(filter.Search))
                query = query.Where(p => p.Name.Contains(filter.Search));

            if (filter.StoreId.HasValue)
                query = query.Where(p => p.StoreId == filter.StoreId.Value);

            if (filter.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            if (filter.IsGettingCategory.HasValue && filter.IsGettingCategory.Value)
                query = query.Where(p => p.Category.Status == true);
            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.ProductDetails.Any(d => d.Price >= filter.MinPrice.Value));

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.ProductDetails.Any(d => d.Price <= filter.MaxPrice.Value));
            if (filter.IsNotGetOutOfStock.HasValue)
                query = query.Where(p => !p.IsOutOfStock);

            if (filter.IsGetStoreOpen.HasValue)
                query = query.Where(p => p.Store.IsOpen);

            // Project to DTO
            var productDtosQuery = query.Select(p => new ProductQueriesDto
            {
                Id = p.Id,
                Name = p.Name,
                Describe = p.Describe,
                IsOutOfStock = p.IsOutOfStock,
                Discount = p.Discount,
                StoreId = p.StoreId,
                CategoryId = p.CategoryId,
                Category = new
                {
                    Id = p.Category.Id,
                    Name = p.Category.Name,
                    Status = p.Category.Status
                },
                AvarageRate = (float)(
                    p.ProductDetails
                        .SelectMany(d => d.Reviews)
                        .Select(r => (double?)r.Rate)
                        .Average() ?? 0
                ),
                Sold = p.ProductDetails.Sum(d => d.Sold),
                ProductDetails = p.ProductDetails.Select(d => new ProductDetailQueriesDto
                {
                    Id = d.Id,
                    IsOutOfStock = d.IsOutOfStock,
                    Sold = d.Sold,
                    Price = d.Price,
                    Weight = d.Weight,
                    Quantity = d.Quantity,
                    Image = d.Image != null ? new ImageQueriesDto
                    {
                        Id = d.Image.Id,
                        Url = d.Image.Url,
                        ThumbUrl = d.Image.ThumbUrl,
                        Name = d.Image.Name
                    } : null,
                    AdditionalData = d.AdditionalData.Select(a => new AdditionalDataQueriesDto
                    {
                        Id = a.Id,
                        Key = a.Key,
                        Value = a.Value
                    }).ToList()
                }).ToList()
            });

            productDtosQuery = (filter.SortBy?.ToLower(), filter.SortDirection?.ToLower()) switch
            {
                ("price", "asc") => productDtosQuery.OrderBy(p => p.ProductDetails.Min(d => d.Price)),
                ("price", "desc") => productDtosQuery.OrderByDescending(p => p.ProductDetails.Max(d => d.Price)),

                ("sold", "asc") => productDtosQuery.OrderBy(p => p.ProductDetails.Sum(d => d.Sold)),
                ("sold", "desc") => productDtosQuery.OrderByDescending(p => p.ProductDetails.Sum(d => d.Sold)),

                _ => productDtosQuery.OrderByDescending(p => p.Id) 
            };


            var totalCount = await productDtosQuery.CountAsync(cancellationToken);

            var pagedItems = await productDtosQuery
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync(cancellationToken);

                return new PagedResult<ProductQueriesDto>(pagedItems, totalCount, filter.PageNumber, filter.PageSize);
        }
    }


}
