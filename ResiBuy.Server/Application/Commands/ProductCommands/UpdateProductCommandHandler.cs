using Confluent.Kafka;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProductCommand(UpdateProductDto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProductCommandHandler(IProductDbService productDbService, IImageDbService imageDbService, IBarcodeDbService barcodeDbService)
        : IRequestHandler<UpdateProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;

                // Get existing product
                var product = await productDbService.GetByIdAsync(dto.Id);
                if (product == null)
                    return ResponseModel.FailureResponse($"Product {dto.Id} không tồn tại");

                // Validate basic product information
                await ValidateBasicProductInfo(dto);

                // Update basic product info
                product.UpdateProduct(dto.Name, dto.Describe, dto.PromotionId, dto.CategoryId, dto.IsOutOfStock, (DateTime)dto.ExpiryDate, (int)dto.WarrantyMonths);

                // Validate and update product details
                await ValidateAndUpdateProductDetails(dto, product);

                // Save changes
                var result = await productDbService.UpdateAsync(product);
                if (result == null)
                    throw new CustomException(ExceptionErrorCode.UpdateFailed,
                        "Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại dữ liệu.");

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

        private async Task ValidateBasicProductInfo(UpdateProductDto dto)
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

            if (dto.PromotionId < 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giảm giá không được nhỏ hơn 0.");


            // Check if name already exists (excluding current product)
            var isNameExists = await productDbService.ExistsByNameAsync(dto.StoreId, dto.Name, dto.Id);
            if (isNameExists)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Tên sản phẩm '{dto.Name}' đã tồn tại trong cửa hàng này.");
            }

            if (dto.ProductDetails == null || !dto.ProductDetails.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm phải có ít nhất một chi tiết sản phẩm.");
        }

        private async Task ValidateAndUpdateProductDetails(UpdateProductDto dto, Product product)
        {
            var existingDetails = product.ProductDetails.ToDictionary(d => d.Id);
            var allDataSets = new List<HashSet<string>>();
            bool isInOrder = false;
            foreach (var detail in product.ProductDetails)
            {
                foreach (var barcode in detail.Barcodes)
                {
                    if (barcode.OrderItemId != null)
                    {
                        isInOrder = true;
                        break;
                    }
                }
            }
            if (dto.Name != product.Name && isInOrder)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Không thể đổi tên sản phẩm khi có chi tiết sản phẩm đã được bán.");
            }
            // Process each product detail from DTO
            foreach (var detailDto in dto.ProductDetails)
            {
                // Validate basic detail info
                ValidateProductDetailBasics(detailDto);

                // Validate and get current data set for AdditionalData
                var currentSet = ValidateAdditionalDataForDetail(detailDto, allDataSets);

                ProductDetail detail;
                bool isNewDetail = detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id);

                if (isNewDetail)
                {
                    // Create new detail
                    detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                    // Set AdditionalData for new detail
                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        detail.AdditionalData = detailDto.AdditionalData
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }

                    // Process Image for new detail
                    await ProcessProductDetailImage(detailDto, detail, null);

                    // Generate barcodes for new detail
                    await GenerateBarcodesForNewDetail(detailDto, detail);

                    product.ProductDetails.Add(detail);
                }
                else
                {
                    // Update existing detail
                    detail = existingDetails[detailDto.Id];

                    // Validate quantity - chỉ được tăng hoặc giữ nguyên
                    await ValidateAndUpdateQuantity(detailDto, detail);

                    detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);

                    // Update AdditionalData
                    await UpdateAdditionalData(detailDto, detail);

                    // Update Image
                    await ProcessProductDetailImage(detailDto, detail, detail.Image);
                }
            }

            // Remove details that are not in the DTO
            await RemoveObsoleteDetails(dto, product, existingDetails);
        }

        private void ValidateProductDetailBasics(UpdateProductDetailDto detailDto)
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

        private async Task ValidateAndUpdateQuantity(UpdateProductDetailDto detailDto, ProductDetail existingDetail)
        {
            var currentQuantity = existingDetail.Quantity;
            var newQuantity = detailDto.Quantity;

            // Kiểm tra quantity chỉ được tăng hoặc giữ nguyên
            if (newQuantity < currentQuantity)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Số lượng chỉ được tăng hoặc giữ nguyên. Số lượng hiện tại: {currentQuantity}, số lượng mới: {newQuantity}");
            }

            // Nếu quantity tăng, tạo thêm barcode
            if (newQuantity > currentQuantity)
            {
                var additionalQuantity = newQuantity - currentQuantity;
                await GenerateAdditionalBarcodes(existingDetail, additionalQuantity);
            }
        }

        private async Task GenerateAdditionalBarcodes(ProductDetail detail, int additionalQuantity)
        {
            try
            {
                // Tạo barcode bổ sung
                var additionalBarcodes = await barcodeDbService.GenerateUniqueBarcodesAsync(additionalQuantity);

                // Khởi tạo danh sách Barcodes nếu chưa có
                if (detail.Barcodes == null)
                {
                    detail.Barcodes = new List<Barcode>();
                }

                // Thêm barcode mới vào danh sách hiện tại
                foreach (var code in additionalBarcodes)
                {
                    detail.Barcodes.Add(new Barcode { Code = code });
                }
            }
            catch (InvalidOperationException ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed,
                    $"Không thể tạo barcode bổ sung cho sản phẩm chi tiết: {ex.Message}");
            }
        }

        private async Task GenerateBarcodesForNewDetail(UpdateProductDetailDto detailDto, ProductDetail detail)
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
                        $"Không thể tạo barcode cho sản phẩm chi tiết mới: {ex.Message}");
                }
            }
            else
            {
                // Nếu Quantity = 0, không cần barcode
                detail.Barcodes = new List<Barcode>();
            }
        }

        private HashSet<string> ValidateAdditionalDataForDetail(UpdateProductDetailDto detailDto, List<HashSet<string>> allDataSets)
        {
            var currentSet = new HashSet<string>();

            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                // Check duplicates within the same detail
                var duplicates = detailDto.AdditionalData
                    .GroupBy(a => new { a.Key, a.Value })
                    .Where(g => g.Count() > 1)
                    .Select(g => $"({g.Key.Key}, {g.Key.Value})")
                    .ToList();

                if (duplicates.Any())
                {
                    var msg = string.Join(", ", duplicates);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Dữ liệu AdditionalData bị trùng trong 1 sản phẩm chi tiết: {msg}");
                }

                currentSet = detailDto.AdditionalData
                    .Select(a => $"{a.Key}|{a.Value}")
                    .ToHashSet();

                // Check duplicates across different details
                if (allDataSets.Any(set => set.SetEquals(currentSet)))
                {
                    var msg = string.Join(", ", currentSet.Select(s => s.Replace("|", ": ")));
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Dữ liệu AdditionalData bị trùng hoàn toàn giữa các sản phẩm chi tiết: {msg}");
                }

                // Validate AdditionalData keys and values
                foreach (var additionalData in detailDto.AdditionalData)
                {
                    if (string.IsNullOrWhiteSpace(additionalData.Key))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Key của AdditionalData không được để trống.");

                    if (string.IsNullOrWhiteSpace(additionalData.Value))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Value của AdditionalData không được để trống.");
                }

                allDataSets.Add(currentSet);
            }

            return currentSet;
        }

        private async Task UpdateAdditionalData(UpdateProductDetailDto detailDto, ProductDetail detail)
        {
            if (detailDto.AdditionalData != null)
            {
                var existingAdds = detail.AdditionalData.ToDictionary(a => a.Id);

                // Update or add AdditionalData
                foreach (var addDto in detailDto.AdditionalData)
                {
                    if (addDto.Id == 0 || !existingAdds.ContainsKey(addDto.Id))
                    {
                        detail.AdditionalData.Add(new AdditionalData(addDto.Key, addDto.Value));
                    }
                    else
                    {
                        var add = existingAdds[addDto.Id];
                        add.Key = addDto.Key;
                        add.Value = addDto.Value;
                    }
                }

                // Remove AdditionalData that are not in DTO
                var dtoAddIds = detailDto.AdditionalData.Select(a => a.Id).ToHashSet();
                detail.AdditionalData.RemoveAll(a => a.Id != 0 && !dtoAddIds.Contains(a.Id));
            }
            else
            {
                // If DTO has no AdditionalData, clear existing ones
                detail.AdditionalData.Clear();
            }
        }

        private async Task ProcessProductDetailImage(UpdateProductDetailDto detailDto, ProductDetail detail, Image existingImage)
        {
            if (string.IsNullOrEmpty(detailDto.Image?.Id))
            {
                // Remove existing image if present
                if (existingImage != null)
                {
                    await imageDbService.DeleteAsync(existingImage);
                    detail.Image = null;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(detailDto.Image.Url))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "URL hình ảnh không được để trống.");

                // Update or create image
                if (existingImage == null || existingImage.Id != detailDto.Image.Id)
                {
                    // Delete old image and create new one
                    if (existingImage != null)
                    {
                        await imageDbService.DeleteAsync(existingImage);
                    }

                    var newImage = new Image();
                    newImage.CreateImage(
                        detailDto.Image.Id,
                        detailDto.Image.Url,
                        detailDto.Image.ThumbUrl,
                        detailDto.Image.Name
                    );
                    detail.Image = newImage;
                }
                else
                {
                    // Update existing image
                    existingImage.UpdateImage(
                        detailDto.Image.Url,
                        detailDto.Image.ThumbUrl,
                        detailDto.Image.Name
                    );
                }
            }
        }

        private async Task RemoveObsoleteDetails(UpdateProductDto dto, Product product, Dictionary<int, ProductDetail> existingDetails)
        {
            var dtoDetailIds = dto.ProductDetails.Select(d => d.Id).ToHashSet();
            var toRemoveDetails = product.ProductDetails
                .Where(d => d.Id != 0 && !dtoDetailIds.Contains(d.Id))
                .ToList();

            foreach (var removeDetail in toRemoveDetails)
            {
                // Only remove if not referenced by any orders
                if (removeDetail.OrderItems == null || !removeDetail.OrderItems.Any())
                {
                    // Delete associated image if exists
                    if (removeDetail.Image != null)
                    {
                        await imageDbService.DeleteAsync(removeDetail.Image);
                    }

                    product.ProductDetails.Remove(removeDetail);
                }
                else
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Không thể xóa chi tiết sản phẩm vì đã có đơn hàng liên quan.");
                }
            }
        }
    }
}
