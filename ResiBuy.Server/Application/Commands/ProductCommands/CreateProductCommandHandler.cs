using Confluent.Kafka;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;
using ResiBuy.Server.Infrastructure.DbServices.PromotionDbService;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record CreateProductCommand(CreateProductDto ProductDto) : IRequest<ResponseModel>;

    public class CreateProductCommandHandler(IProductDbService productDbService, IPromotionDbService promotionDbService, IBarcodeDbService barcodeDbService) : IRequestHandler<CreateProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;

                // Validate basic product information
                await ValidateBasicProductInfo(dto);

                // Validate existing product name
                var existedProduct = await productDbService.GetByNameAsync(dto.StoreId, dto.Name);
                if (existedProduct != null)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Sản phẩm '{dto.Name}' đã tồn tại trong cửa hàng này.");
                }

                // Create product
                var product = new Product(dto.Name, dto.Describe, dto.PromotionId, dto.StoreId, dto.CategoryId)
                {
                    ExpiryDate = dto.ExpiryDate,
                    WarrantyMonths = dto.WarrantyMonths
                };

                // Validate and process product details
                await ValidateAndProcessProductDetails(dto.ProductDetails, product);

                // Save to database
                var result = await productDbService.CreateAsync(product);
                if (result == null)
                    throw new CustomException(ExceptionErrorCode.CreateFailed,
                        "Không thể tạo sản phẩm mới. Vui lòng kiểm tra lại dữ liệu.");

                return ResponseModel.SuccessResponse(result);
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        private async Task ValidateBasicProductInfo(CreateProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Tên sản phẩm không được để trống.");

            if (dto.Name.Length > 255)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Tên sản phẩm không được vượt quá 255 ký tự.");

            if (dto.StoreId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "StoreId không hợp lệ.");

            if (dto.CategoryId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "CategoryId không hợp lệ.");

            if (dto.PromotionId <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "PromotionId không hợp lệ.");

            if (dto.WarrantyMonths.HasValue && dto.WarrantyMonths <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Thời gian bảo hành phải lớn hơn 0 tháng.");

            if (dto.ExpiryDate.HasValue && dto.ExpiryDate.Value <= DateTime.UtcNow)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Hạn sử dụng phải sau ngày hiện tại.");

            if (dto.ProductDetails == null || !dto.ProductDetails.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm phải có ít nhất một chi tiết sản phẩm.");

            var promotion = await promotionDbService.GetPromotionByIdAsync(dto.PromotionId);
            if (promotion == null)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Khuyến mãi với ID {dto.PromotionId} không tồn tại.");
            }
        }

        private async Task ValidateAndProcessProductDetails(IEnumerable<CreateProductDetailDto> detailDtos, Product product)
        {
            var detailDataSets = new List<HashSet<string>>();

            foreach (var detailDto in detailDtos)
            {
                // Validate basic detail info
                ValidateProductDetailBasics(detailDto);

                var detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                // Validate and process AdditionalData
                var dataSet = ValidateAndProcessAdditionalData(detailDto, detail, detailDataSets);
                if (dataSet.Count > 0)
                    detailDataSets.Add(dataSet);

                // Process Image
                ProcessProductDetailImage(detailDto, detail);

                // Generate and process Barcodes
                await GenerateAndProcessBarcodes(detailDto, detail);

                product.ProductDetails.Add(detail);
            }
        }

        private void ValidateProductDetailBasics(CreateProductDetailDto detailDto)
        {
            if (detailDto.Price <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giá sản phẩm chi tiết phải lớn hơn 0.");

            if (detailDto.Weight < 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Trọng lượng không hợp lệ.");

            if (detailDto.Quantity < 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Số lượng không hợp lệ.");

            if (detailDto.IsOutOfStock && detailDto.Quantity > 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm đã hết hàng thì số lượng phải bằng 0.");
        }

        private HashSet<string> ValidateAndProcessAdditionalData(CreateProductDetailDto detailDto, ProductDetail detail, List<HashSet<string>> existingDataSets)
        {
            var dataSet = new HashSet<string>();

            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                // Check duplicates within the same detail
                var duplicatesInSame = detailDto.AdditionalData
                    .GroupBy(a => new { a.Key, a.Value })
                    .Where(g => g.Count() > 1)
                    .Select(g => $"({g.Key.Key}, {g.Key.Value})")
                    .ToList();

                if (duplicatesInSame.Any())
                {
                    var message = string.Join(", ", duplicatesInSame);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Phân loại bị trùng trong 1 chi tiết sản phẩm: {message}");
                }

                dataSet = detailDto.AdditionalData
                    .Select(a => $"{a.Key}|{a.Value}")
                    .ToHashSet();

                // Check duplicates across different details
                if (existingDataSets.Any(existing => existing.SetEquals(dataSet)))
                {
                    var formatted = string.Join(", ", dataSet.Select(s => s.Replace("|", ": ")));
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Các phân loại bị trùng hoàn toàn giữa các chi tiết sản phẩm: {formatted}");
                }

                // Validate AdditionalData keys and values
                foreach (var additionalData in detailDto.AdditionalData)
                {
                    if (string.IsNullOrWhiteSpace(additionalData.Key))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Tên của phân loại không được để trống.");

                    if (string.IsNullOrWhiteSpace(additionalData.Value))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "thuộc tính của phân loại không được để trống.");
                }

                detail.AdditionalData = detailDto.AdditionalData
                    .Select(a => new AdditionalData(a.Key, a.Value))
                    .ToList();
            }

            return dataSet;
        }

        private void ProcessProductDetailImage(CreateProductDetailDto detailDto, ProductDetail detail)
        {
            if (detailDto.Image != null && !string.IsNullOrEmpty(detailDto.Image.Id))
            {
                if (string.IsNullOrWhiteSpace(detailDto.Image.Url))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "URL hình ảnh không được để trống.");

                var image = new Image();
                image.CreateImage(
                    detailDto.Image.Id,
                    detailDto.Image.Url,
                    detailDto.Image.ThumbUrl,
                    detailDto.Image.Name
                );
                detail.Image = image;
            }
        }

        private async Task GenerateAndProcessBarcodes(CreateProductDetailDto detailDto, ProductDetail detail)
        {
            // Chỉ tạo barcode nếu Quantity > 0
            if (detailDto.Quantity > 0)
            {
                try
                {
                    // Tạo barcode tự động từ BarcodeDbService
                    var generatedBarcodes = await barcodeDbService.GenerateUniqueBarcodesAsync(detailDto.Quantity);

                    // Chuyển đổi thành danh sách Barcode entities
                    detail.Barcodes = generatedBarcodes
                        .Select(code => new Barcode { Code = code })
                        .ToList();
                }
                catch (InvalidOperationException ex)
                {
                    throw new CustomException(ExceptionErrorCode.CreateFailed,
                        $"Không thể tạo barcode cho sản phẩm chi tiết: {ex.Message}");
                }
            }
            else
            {
                // Nếu Quantity = 0, không cần barcode
                detail.Barcodes = new List<Barcode>();
            }
        }
    }
}