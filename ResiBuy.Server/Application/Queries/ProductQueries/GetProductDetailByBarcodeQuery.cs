using ResiBuy.Server.Application.Queries.ProductQueries.DTOs;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductDetailByBarcodeQuery(string Barcode) : IRequest<ResponseModel>;

    public class GetProductDetailByBarcodeQueryHandler(IProductDbService productDbService) : IRequestHandler<GetProductDetailByBarcodeQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductDetailByBarcodeQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Validate barcode input
                if (string.IsNullOrWhiteSpace(request.Barcode))
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "Barcode không được để trống.");
                }

                var barcode = request.Barcode.Trim();

                // Get product detail by barcode
                var productDetail = await productDbService.GetProductDetailByBarcodeAsync(barcode);

                if (productDetail == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound,
                        $"Không tìm thấy sản phẩm với barcode: {barcode}");
                }

                // Tìm barcode cụ thể để lấy giá từ OrderItem
                var barcodeEntity = productDetail.Barcodes.FirstOrDefault(b => b.Code == barcode);
                var price = barcodeEntity?.OrderItem?.Price ?? productDetail.Price; // Fallback to ProductDetail.Price nếu không có OrderItem

                // Create response DTO
                var response = new ProductDetailBarcodeResponseDto
                {
                    Id = productDetail.Id,
                    ProductId = productDetail.ProductId,
                    ProductName = productDetail.Product?.Name,
                    Price = price,
                    Weight = productDetail.Weight,
                    Quantity = productDetail.Quantity,
                    IsOutOfStock = productDetail.IsOutOfStock,
                    Barcode = barcode,
                    Image = productDetail.Image != null ? new DTOs.ImageDto
                    {
                        Id = productDetail.Image.Id,
                        Url = productDetail.Image.Url,
                        ThumbUrl = productDetail.Image.ThumbUrl,
                        Name = productDetail.Image.Name
                    } : null,
                    AdditionalData = productDetail.AdditionalData?.Select(ad => new AdditionalDataDto
                    {
                        Key = ad.Key,
                        Value = ad.Value
                    }).ToList() ?? new List<AdditionalDataDto>(),
                    Product = productDetail.Product != null ? new ProductBasicInfoDto
                    {
                        Id = productDetail.Product.Id,
                        Name = productDetail.Product.Name,
                        Describe = productDetail.Product.Describe,
                        ExpiryDate = productDetail.Product.ExpiryDate,
                        WarrantyMonths = productDetail.Product.WarrantyMonths,
                        CategoryId = productDetail.Product.CategoryId,
                        StoreId = productDetail.Product.StoreId,
                        IsActive = !productDetail.Product.IsOutOfStock // Sử dụng IsOutOfStock thay vì IsActive
                    } : null
                };

                return ResponseModel.SuccessResponse(response);
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,
                    $"Lỗi khi tìm kiếm sản phẩm theo barcode: {ex.Message}");
            }
        }
    }
}