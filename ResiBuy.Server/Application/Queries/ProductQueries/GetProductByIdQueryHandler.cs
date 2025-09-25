using ResiBuy.Server.Application.Queries.ProductQueries.DTOs;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdQuery(int id) : IRequest<ResponseModel>;

    public class GetProductByIdQueryHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetProductByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.id <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id sản phẩm phải lớn hơn 0");
            var product = await ProductDbService.GetByIdAsync(query.id);
            if (product == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy sản phẩm");

            return ResponseModel.SuccessResponse(new ProductQueriesDto
            {
                Id = product.Id,
                Name = product.Name,
                Describe = product.Describe,
                IsOutOfStock = product.IsOutOfStock,

                // n?u Product có Promotion -> l?y Discount t? Promotion, n?u không thì 0
                Discount = product.Promotion != null ? product.Promotion.Discount : 0,

                StoreId = product.StoreId,
                CategoryId = product.CategoryId,
                Category = new
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    Status = product.Category.Status
                },
                AvarageRate = (float)(
                    product.ProductDetails
                        .SelectMany(d => d.Reviews)
                        .Select(r => (double?)r.Rate)
                        .Average() ?? 0
                ),
                Sold = product.ProductDetails.Sum(d => d.Sold),
                ProductDetails = product.ProductDetails.Select(d => new ProductDetailQueriesDto
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
                    }).ToList(),
                    Barcodes = d.Barcodes.Select(b => new BarcodeDto
                    {
                        Id = b.Id,
                        Code = b.Code,
                        OrderItemId = b.OrderItemId,
                    }).ToList()
                }).ToList(),
                ExpiryDate = product.ExpiryDate,
                WarrantyMonths = product.WarrantyMonths,
            });

        }
    }
}
