using MediatR;
using ResiBuy.Server.Infrastructure.Model;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProduct2Command(UpdateProduct2Dto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProduct2CommandHandler : IRequestHandler<UpdateProduct2Command, ResponseModel>
    {
        private readonly IProductDbService _productDbService;
        private readonly IImageDbService _imageDbService;
        private readonly IBarcodeDbService _barcodeDbService;

        public UpdateProduct2CommandHandler(
            IProductDbService productDbService,
            IImageDbService imageDbService,
            IBarcodeDbService barcodeDbService)
        {
            _productDbService = productDbService;
            _imageDbService = imageDbService;
            _barcodeDbService = barcodeDbService;
        }

        public async Task<ResponseModel> Handle(UpdateProduct2Command command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;

                // Get existing product
                var product = await _productDbService.GetByIdAsync(dto.Id);
                if (product == null)
                    return ResponseModel.FailureResponse($"Sản phẩm {dto.Id} không tồn tại");

                // Validate basic product information
                await ValidateBasicProductInfo(dto);

                // Update basic product info
                product.UpdateProduct(dto.Name, dto.Describe, dto.PromotionId, dto.CategoryId, dto.IsOutOfStock, (DateTime)dto.ExpiryDate, dto.WarrantyMonths);

                // Validate and update product details
                await ValidateAndUpdateProductDetails(dto, product);

                // Save changes
                var result = await _productDbService.UpdateAsync(product);
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

        private async Task ValidateBasicProductInfo(UpdateProduct2Dto dto)
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


            var isNameExists = await _productDbService.ExistsByNameAsync(dto.StoreId, dto.Name, dto.Id);
            if (isNameExists)
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Tên sản phẩm '{dto.Name}' đã tồn tại trong cửa hàng này.");

            if (dto.ProductDetails == null || !dto.ProductDetails.Any())
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm phải có ít nhất một chi tiết sản phẩm.");
        }

        private async Task ValidateAndUpdateProductDetails(UpdateProduct2Dto dto, Product product)
        {
            var existingDetails = product.ProductDetails.ToDictionary(d => d.Id);
            var allDataSets = new List<HashSet<string>>();

            foreach (var detailDto in dto.ProductDetails)
            {
                ValidateProductDetailBasics(detailDto);
                var currentSet = ValidateAdditionalDataForDetail(detailDto, allDataSets);

                ProductDetail detail;
                bool isNewDetail = detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id);

                if (isNewDetail)
                {
                    detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        detail.AdditionalData = detailDto.AdditionalData
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }

                    await ProcessProductDetailImage(detailDto, detail, null);
                    await GenerateBarcodesForNewDetail(detailDto, detail);

                    product.ProductDetails.Add(detail);
                }
                else
                {
                    detail = existingDetails[detailDto.Id];
                    await ValidateAndUpdateQuantity(detailDto, detail);
                    detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);
                    await UpdateAdditionalData(detailDto, detail);
                    await ProcessProductDetailImage(detailDto, detail, detail.Image);
                }
            }

            await RemoveObsoleteDetails(dto, product, existingDetails);
        }

        private void ValidateProductDetailBasics(UpdateProductDetail2Dto detailDto)
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

        private async Task ValidateAndUpdateQuantity(UpdateProductDetail2Dto detailDto, ProductDetail existingDetail)
        {
            var currentQuantity = existingDetail.Quantity;
            var newQuantity = detailDto.Quantity;

            if (newQuantity < currentQuantity)
            {
                var quantityToReduce = currentQuantity - newQuantity;
                if (detailDto.ListBarcode == null || detailDto.ListBarcode.Count < quantityToReduce)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Phải cung cấp đủ {quantityToReduce} barcode để xóa khi giảm số lượng từ {currentQuantity} xuống {newQuantity}.");

                var barcodesToDelete = detailDto.ListBarcode.Take(quantityToReduce).ToList();
                var invalidBarcodes = await _barcodeDbService.GetBarcodesWithOrderItemAsync(barcodesToDelete);
                if (invalidBarcodes.Any())
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Không thể xóa các barcode đã bán: {string.Join(", ", invalidBarcodes)}");

                await _barcodeDbService.DeleteBarcodesAsync(barcodesToDelete);
                existingDetail.Quantity = newQuantity; // Explicitly update quantity
            }
            else if (newQuantity > currentQuantity)
            {
                var additionalQuantity = newQuantity - currentQuantity;
                await GenerateAdditionalBarcodes(existingDetail, additionalQuantity);
                existingDetail.Quantity = newQuantity; // Explicitly update quantity
            }
        }

        private async Task GenerateAdditionalBarcodes(ProductDetail detail, int additionalQuantity)
        {
            try
            {
                var additionalBarcodes = await _barcodeDbService.GenerateUniqueBarcodesAsync(additionalQuantity);
                if (detail.Barcodes == null)
                    detail.Barcodes = new List<Barcode>();

                foreach (var code in additionalBarcodes)
                {
                    detail.Barcodes.Add(new Barcode { Code = code, ProductDetailId = detail.Id });
                }
            }
            catch (InvalidOperationException ex)
            {
                throw new CustomException(ExceptionErrorCode.UpdateFailed,
                    $"Không thể tạo barcode bổ sung: {ex.Message}");
            }
        }

        private async Task GenerateBarcodesForNewDetail(UpdateProductDetail2Dto detailDto, ProductDetail detail)
        {
            if (detailDto.Quantity > 0)
            {
                try
                {
                    var generatedBarcodes = await _barcodeDbService.GenerateUniqueBarcodesAsync(detailDto.Quantity);
                    detail.Barcodes = generatedBarcodes
                        .Select(code => new Barcode { Code = code, ProductDetailId = detail.Id })
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
                detail.Barcodes = new List<Barcode>();
            }
        }

        private HashSet<string> ValidateAdditionalDataForDetail(UpdateProductDetail2Dto detailDto, List<HashSet<string>> allDataSets)
        {
            var currentSet = new HashSet<string>();

            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
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

                if (allDataSets.Any(set => set.SetEquals(currentSet)))
                {
                    var msg = string.Join(", ", currentSet.Select(s => s.Replace("|", ": ")));
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Dữ liệu AdditionalData bị trùng giữa các sản phẩm chi tiết: {msg}");
                }

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

        private async Task UpdateAdditionalData(UpdateProductDetail2Dto detailDto, ProductDetail detail)
        {
            if (detailDto.AdditionalData != null)
            {
                var existingAdds = detail.AdditionalData.ToDictionary(a => a.Id);

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

                var dtoAddIds = detailDto.AdditionalData.Select(a => a.Id).ToHashSet();
                detail.AdditionalData.RemoveAll(a => a.Id != 0 && !dtoAddIds.Contains(a.Id));
            }
            else
            {
                detail.AdditionalData.Clear();
            }
        }

        private async Task ProcessProductDetailImage(UpdateProductDetail2Dto detailDto, ProductDetail detail, Image existingImage)
        {
            if (string.IsNullOrEmpty(detailDto.Image?.Id))
            {
                if (existingImage != null)
                {
                    await _imageDbService.DeleteAsync(existingImage);
                    detail.Image = null;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(detailDto.Image.Url))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "URL hình ảnh không được để trống.");

                if (existingImage == null || existingImage.Id != detailDto.Image.Id)
                {
                    if (existingImage != null)
                    {
                        await _imageDbService.DeleteAsync(existingImage);
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
                    existingImage.UpdateImage(
                        detailDto.Image.Url,
                        detailDto.Image.ThumbUrl,
                        detailDto.Image.Name
                    );
                }
            }
        }

        private async Task RemoveObsoleteDetails(UpdateProduct2Dto dto, Product product, Dictionary<int, ProductDetail> existingDetails)
        {
            var dtoDetailIds = dto.ProductDetails.Select(d => d.Id).ToHashSet();
            var toRemoveDetails = product.ProductDetails
                .Where(d => d.Id != 0 && !dtoDetailIds.Contains(d.Id))
                .ToList();

            foreach (var removeDetail in toRemoveDetails)
            {
                if (removeDetail.OrderItems == null || !removeDetail.OrderItems.Any())
                {
                    if (removeDetail.Image != null)
                    {
                        await _imageDbService.DeleteAsync(removeDetail.Image);
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