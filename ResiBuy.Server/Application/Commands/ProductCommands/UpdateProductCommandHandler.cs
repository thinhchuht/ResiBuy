using Confluent.Kafka;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProductCommand(UpdateProductDto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProductCommandHandler(IProductDbService productDbService, IImageDbService imageDbService)
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
                product.UpdateProduct(dto.Name, dto.Describe, dto.Discount, dto.CategoryId, dto.IsOutOfStock);

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

            if (dto.Discount < 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giảm giá không được nhỏ hơn 0.");

            if (dto.Discount > 100)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giảm giá không được vượt quá 100%.");

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
            var allBarcodes = new List<string>();
            var allCurrentBarcodes = new List<string>();

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

                    product.ProductDetails.Add(detail);
                }
                else
                {
                    // Update existing detail
                    detail = existingDetails[detailDto.Id];
                    detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);

                    // Update AdditionalData
                    await UpdateAdditionalData(detailDto, detail);

                    // Update Image
                    await ProcessProductDetailImage(detailDto, detail, detail.Image);
                }

                // Validate and process Barcodes
                await ValidateAndProcessBarcodes(detailDto, detail, allBarcodes, allCurrentBarcodes, isNewDetail);
            }

            // Remove details that are not in the DTO
            await RemoveObsoleteDetails(dto, product, existingDetails);

            // Final validation: check all barcodes across the system (excluding current product barcodes)
            if (allBarcodes.Any())
            {
                var barcodesToCheck = allBarcodes.Except(allCurrentBarcodes).ToList();
                if (barcodesToCheck.Any())
                {
                    var existingCodes = await productDbService.QueryBarcodesAsync(barcodesToCheck);
                    if (existingCodes.Any())
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Các barcode đã tồn tại trong hệ thống: {string.Join(", ", existingCodes)}");
                    }
                }
            }
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

        private async Task ValidateAndProcessBarcodes(UpdateProductDetailDto detailDto, ProductDetail detail,
            List<string> allBarcodes, List<string> allCurrentBarcodes, bool isNewDetail)
        {
            // Get current barcodes for existing details
            if (!isNewDetail && detail.Barcodes != null)
            {
                allCurrentBarcodes.AddRange(detail.Barcodes.Select(b => b.Code));
            }

            if (detailDto.Barcodes != null && detailDto.Barcodes.Any())
            {
                // Validate barcode count matches quantity
                if (detailDto.Barcodes.Count != detailDto.Quantity)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Số lượng barcode ({detailDto.Barcodes.Count}) phải bằng với Quantity ({detailDto.Quantity}) cho sản phẩm chi tiết.");
                }

                // Validate barcode format and uniqueness within detail
                var cleanBarcodes = new List<string>();
                foreach (var barcode in detailDto.Barcodes)
                {
                    if (string.IsNullOrWhiteSpace(barcode))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Barcode không được để trống.");

                    var cleanBarcode = barcode.Trim();
                    if (cleanBarcodes.Contains(cleanBarcode))
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Barcode bị trùng trong cùng 1 ProductDetail: {cleanBarcode}");

                    cleanBarcodes.Add(cleanBarcode);
                }

                // Check for duplicates across all details in this product (excluding current detail's existing barcodes)
                var existingBarcodesInThisProduct = allBarcodes.ToList();
                var duplicatesAcrossDetails = existingBarcodesInThisProduct.Intersect(cleanBarcodes).ToList();
                if (duplicatesAcrossDetails.Any())
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Barcode bị trùng giữa các ProductDetail: {string.Join(", ", duplicatesAcrossDetails)}");
                }

                allBarcodes.AddRange(cleanBarcodes);

                // Update barcodes for the detail
                detail.Barcodes = cleanBarcodes
                    .Select(code => new Barcode { Code = code })
                    .ToList();
            }
            else
            {
                if (detailDto.Quantity > 0)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "Nếu Quantity > 0 thì phải có danh sách Barcode tương ứng.");
                }

                // Clear barcodes if no barcodes provided
                if (!isNewDetail)
                {
                    detail.Barcodes?.Clear();
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
