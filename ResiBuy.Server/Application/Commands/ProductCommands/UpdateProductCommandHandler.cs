using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;
using ResiBuy.Server.Infrastructure.DbServices.BarcodeDbServices;
using System.Text;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProductCommand(UpdateProductDto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProductCommandHandler(
        IProductDbService productDbService,
        IImageDbService imageDbService,
        IBarcodeDbService barcodeDbService,
        ILogger<UpdateProductCommandHandler> logger)
        : IRequestHandler<UpdateProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Bắt đầu xử lý UpdateProductCommand cho ProductId: {ProductId}", command.ProductDto.Id);

            // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
            logger.LogInformation("Bắt đầu transaction cho ProductId: {ProductId}", command.ProductDto.Id);
            using var transaction = await productDbService.BeginTransactionAsync();
            try
            {
                var dto = command.ProductDto;
                logger.LogDebug("DTO nhận được: {@ProductDto}", dto);

                // Lấy sản phẩm hiện có từ cơ sở dữ liệu
                var product = await productDbService.GetByIdAsync(dto.Id);
                if (product == null)
                {
                    logger.LogError("Sản phẩm không tồn tại: {ProductId}", dto.Id);
                    return ResponseModel.FailureResponse($"Sản phẩm {dto.Id} không tồn tại");
                }
                logger.LogInformation("Tìm thấy sản phẩm: {ProductId}", dto.Id);

                // Kiểm tra thông tin cơ bản của sản phẩm
                await ValidateBasicProductInfo(dto);

                // Cập nhật thông tin cơ bản của sản phẩm
                logger.LogInformation("Cập nhật thông tin cơ bản cho ProductId: {ProductId}", dto.Id);
                product.UpdateProduct(dto.Name, dto.Describe, dto.PromotionId, dto.CategoryId, dto.IsOutOfStock);

                // Kiểm tra và cập nhật chi tiết sản phẩm
                logger.LogInformation("Bắt đầu cập nhật ProductDetails cho ProductId: {ProductId}", dto.Id);
                await ValidateAndUpdateProductDetails(dto, product);

                // Lưu thay đổi vào cơ sở dữ liệu
                logger.LogInformation("Lưu thay đổi vào cơ sở dữ liệu cho ProductId: {ProductId}", dto.Id);
                var result = await productDbService.UpdateAsync(product);
                if (result == null)
                {
                    logger.LogError("Không thể cập nhật sản phẩm: {ProductId}. Dữ liệu không hợp lệ.", dto.Id);
                    throw new CustomException(ExceptionErrorCode.UpdateFailed,
                        "Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại dữ liệu.");
                }

                // Commit transaction nếu mọi thứ thành công
                logger.LogInformation("Commit transaction cho ProductId: {ProductId}", dto.Id);
                await transaction.CommitAsync();
                logger.LogInformation("Cập nhật sản phẩm thành công: {ProductId}", dto.Id);
                return ResponseModel.SuccessResponse(result);
            }
            catch (CustomException ex)
            {
                // Rollback transaction nếu có lỗi
                logger.LogError(ex, "Lỗi khi xử lý UpdateProductCommand cho ProductId: {ProductId}. Rollback transaction.", command.ProductDto.Id);
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                // Rollback transaction nếu có lỗi không mong muốn
                logger.LogError(ex, "Lỗi không mong muốn khi xử lý UpdateProductCommand cho ProductId: {ProductId}. Rollback transaction.", command.ProductDto.Id);
                await transaction.RollbackAsync();
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        // Kiểm tra thông tin cơ bản của sản phẩm
        private async Task ValidateBasicProductInfo(UpdateProductDto dto)
        {
            logger.LogDebug("Kiểm tra thông tin cơ bản cho ProductId: {ProductId}", dto.Id);

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                logger.LogError("Tên sản phẩm trống cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Tên sản phẩm không được để trống.");
            }

            if (dto.Name.Length > 255)
            {
                logger.LogError("Tên sản phẩm vượt quá 255 ký tự cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Tên sản phẩm không được vượt quá 255 ký tự.");
            }

            if (dto.StoreId == Guid.Empty)
            {
                logger.LogError("StoreId không hợp lệ cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "StoreId không hợp lệ.");
            }

            if (dto.CategoryId == Guid.Empty)
            {
                logger.LogError("CategoryId không hợp lệ cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "CategoryId không hợp lệ.");
            }

            if (dto.PromotionId < 0)
            {
                logger.LogError("Giảm giá không hợp lệ cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giảm giá không được nhỏ hơn 0.");
            }

            // Kiểm tra tên sản phẩm đã tồn tại (trừ sản phẩm hiện tại)
            logger.LogDebug("Kiểm tra tên sản phẩm đã tồn tại: {Name}, StoreId: {StoreId}, ProductId: {ProductId}", dto.Name, dto.StoreId, dto.Id);
            var isNameExists = await productDbService.ExistsByNameAsync(dto.StoreId, dto.Name, dto.Id);
            if (isNameExists)
            {
                logger.LogError("Tên sản phẩm đã tồn tại: {Name}, StoreId: {StoreId}, ProductId: {ProductId}", dto.Name, dto.StoreId, dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Tên sản phẩm '{dto.Name}' đã tồn tại trong cửa hàng này.");
            }

            if (dto.ProductDetails == null || !dto.ProductDetails.Any())
            {
                logger.LogError("Không có ProductDetails cho ProductId: {ProductId}", dto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm phải có ít nhất một chi tiết sản phẩm.");
            }
        }

        // Kiểm tra và cập nhật chi tiết sản phẩm
        private async Task ValidateAndUpdateProductDetails(UpdateProductDto dto, Product product)
        {
            logger.LogInformation("Bắt đầu xử lý {Count} ProductDetails cho ProductId: {ProductId}", dto.ProductDetails.Count, dto.Id);
            var existingDetails = product.ProductDetails.ToDictionary(d => d.Id);
            var allDataCombinations = new HashSet<string>(); // Lưu tổ hợp Key|Value duy nhất của các ProductDetail

            // Xử lý từng chi tiết sản phẩm từ DTO
            foreach (var detailDto in dto.ProductDetails)
            {
                logger.LogInformation("Xử lý ProductDetailId: {DetailId} (IsNew: {IsNew})", detailDto.Id, detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id));

                // Kiểm tra thông tin cơ bản của chi tiết sản phẩm
                ValidateProductDetailBasics(detailDto);

                // Kiểm tra tính duy nhất của tổ hợp AdditionalData trước khi xử lý (cả mới và cập nhật)
                if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                {
                    var combination = string.Join("|", detailDto.AdditionalData
                        .OrderBy(a => NormalizeString(a.Key))
                        .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));
                    logger.LogDebug("Tổ hợp AdditionalData cho ProductDetailId: {DetailId}: {Combination}", detailDto.Id, combination);
                    if (allDataCombinations.Contains(combination))
                    {
                        var msg = string.Join(", ", detailDto.AdditionalData.Select(a => $"{a.Key}: {a.Value}"));
                        logger.LogError("Tổ hợp AdditionalData bị trùng cho ProductDetailId: {DetailId}: {Combination}", detailDto.Id, msg);
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Tổ hợp AdditionalData '{msg}' đã tồn tại trong một ProductDetail khác.");
                    }
                    allDataCombinations.Add(combination);
                }

                ProductDetail detail;
                bool isNewDetail = detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id);

                if (isNewDetail)
                {
                    // Tạo chi tiết sản phẩm mới
                    logger.LogInformation("Tạo ProductDetail mới cho ProductId: {ProductId}", dto.Id);
                    detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                    // Thiết lập AdditionalData cho chi tiết mới, giữ nguyên Key/Value gốc
                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        logger.LogDebug("Thêm AdditionalData cho ProductDetail mới: {@AdditionalData}", detailDto.AdditionalData);
                        detail.AdditionalData = detailDto.AdditionalData
                            .GroupBy(a => NormalizeString(a.Key))
                            .Select(g => g.First()) // Lấy bản ghi đầu tiên nếu có trùng Key
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }

                    // Xử lý hình ảnh cho chi tiết mới
                    await ProcessProductDetailImage(detailDto, detail, null);

                    // Tạo mã vạch cho chi tiết mới
                    await GenerateBarcodesForNewDetail(detailDto, detail);

                    product.ProductDetails.Add(detail);
                }
                else
                {
                    // Cập nhật chi tiết sản phẩm hiện có
                    detail = existingDetails[detailDto.Id];
                    logger.LogInformation("Cập nhật ProductDetailId: {DetailId}", detail.Id);

                    // Kiểm tra xem chi tiết có liên quan đến đơn hàng không
                    bool hasOrderItems = detail.OrderItems != null && detail.OrderItems.Any();
                    logger.LogDebug("ProductDetailId: {DetailId} có OrderItems: {HasOrderItems}", detail.Id, hasOrderItems);

                    if (hasOrderItems)
                    {
                        // Chỉ cho phép cập nhật Price, Weight, Quantity, IsOutOfStock; không cho giảm Quantity
                        await ValidateAndUpdateQuantity(detailDto, detail, true);
                        detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);

                        // Ngăn cập nhật AdditionalData nếu có đơn hàng
                        if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                        {
                            var existingData = detail.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => NormalizeString(a.Value));
                            var newData = detailDto.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => NormalizeString(a.Value));
                            if (!existingData.Count.Equals(newData.Count) || existingData.Any(kvp => !newData.ContainsKey(kvp.Key) || newData[kvp.Key] != kvp.Value))
                            {
                                logger.LogError("Cố gắng cập nhật AdditionalData cho ProductDetailId: {DetailId} khi có OrderItems", detail.Id);
                                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                    $"Không thể cập nhật AdditionalData cho ProductDetail {detail.Id} vì đã có đơn hàng liên quan.");
                            }
                        }
                    }
                    else
                    {
                        // Cho phép cập nhật đầy đủ nếu không có đơn hàng, kể cả giảm Quantity
                        await ValidateAndUpdateQuantity(detailDto, detail, false);
                        detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);

                        // Cập nhật AdditionalData và kiểm tra lại tổ hợp
                        await UpdateAdditionalData(detailDto, detail, product, detail.Id);
                    }

                    // Cập nhật hình ảnh
                    await ProcessProductDetailImage(detailDto, detail, detail.Image);
                }
            }

            // Xóa các chi tiết không còn trong DTO
            logger.LogInformation("Xóa các ProductDetails không còn trong DTO cho ProductId: {ProductId}", dto.Id);
            await RemoveObsoleteDetails(dto, product, existingDetails);
        }

        // Kiểm tra thông tin cơ bản của chi tiết sản phẩm
        private void ValidateProductDetailBasics(UpdateProductDetailDto detailDto)
        {
            logger.LogDebug("Kiểm tra thông tin cơ bản cho ProductDetailId: {DetailId}", detailDto.Id);

            if (detailDto.Price <= 0)
            {
                logger.LogError("Giá không hợp lệ cho ProductDetailId: {DetailId}", detailDto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Giá sản phẩm chi tiết phải lớn hơn 0.");
            }

            if (detailDto.Weight < 0)
            {
                logger.LogError("Trọng lượng không hợp lệ cho ProductDetailId: {DetailId}", detailDto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Trọng lượng không hợp lệ.");
            }

            if (detailDto.Quantity < 0)
            {
                logger.LogError("Số lượng không hợp lệ cho ProductDetailId: {DetailId}", detailDto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Số lượng không hợp lệ.");
            }

            if (detailDto.IsOutOfStock && detailDto.Quantity > 0)
            {
                logger.LogError("Sản phẩm hết hàng nhưng số lượng > 0 cho ProductDetailId: {DetailId}", detailDto.Id);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Sản phẩm đã hết hàng thì số lượng phải bằng 0.");
            }
        }

        // Kiểm tra và cập nhật số lượng
        private async Task ValidateAndUpdateQuantity(UpdateProductDetailDto detailDto, ProductDetail existingDetail, bool hasOrderItems)
        {
            var currentQuantity = existingDetail.Quantity;
            var newQuantity = detailDto.Quantity;
            logger.LogDebug("Kiểm tra số lượng cho ProductDetailId: {DetailId}. Current: {Current}, New: {New}, HasOrderItems: {HasOrderItems}",
                existingDetail.Id, currentQuantity, newQuantity, hasOrderItems);

            if (hasOrderItems && newQuantity < currentQuantity)
            {
                logger.LogError("Không thể giảm số lượng khi có OrderItems cho ProductDetailId: {DetailId}. Current: {Current}, New: {New}",
                    existingDetail.Id, currentQuantity, newQuantity);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    $"Số lượng không thể giảm khi có đơn hàng liên quan. Số lượng hiện tại: {currentQuantity}, số lượng mới: {newQuantity}");
            }

            if (newQuantity > currentQuantity)
            {
                // Nếu số lượng tăng, tạo thêm mã vạch
                var additionalQuantity = newQuantity - currentQuantity;
                logger.LogInformation("Tăng số lượng cho ProductDetailId: {DetailId}. Thêm {AdditionalQuantity} barcode", existingDetail.Id, additionalQuantity);
                await GenerateAdditionalBarcodes(existingDetail, additionalQuantity);
            }
            else if (newQuantity < currentQuantity && !hasOrderItems)
            {
                // Nếu số lượng giảm và không có OrderItems, xóa bớt mã vạch
                var removeQuantity = currentQuantity - newQuantity;
                logger.LogInformation("Giảm số lượng cho ProductDetailId: {DetailId}. Xóa {RemoveQuantity} barcode", existingDetail.Id, removeQuantity);
                await RemoveBarcodes(existingDetail, removeQuantity, detailDto.BarcodesToRemove);
            }
        }

        // Tạo thêm mã vạch cho chi tiết sản phẩm
        private async Task GenerateAdditionalBarcodes(ProductDetail detail, int additionalQuantity)
        {
            logger.LogDebug("Tạo {AdditionalQuantity} barcode cho ProductDetailId: {DetailId}", additionalQuantity, detail.Id);
            try
            {
                // Tạo mã vạch bổ sung
                var additionalBarcodes = await barcodeDbService.GenerateUniqueBarcodesAsync(additionalQuantity);

                // Khởi tạo danh sách Barcodes nếu chưa có
                if (detail.Barcodes == null)
                {
                    detail.Barcodes = new List<Barcode>();
                }

                // Thêm mã vạch mới vào danh sách
                foreach (var code in additionalBarcodes)
                {
                    detail.Barcodes.Add(new Barcode { Code = code });
                }
                logger.LogInformation("Đã tạo {Count} barcode cho ProductDetailId: {DetailId}", additionalBarcodes.Count, detail.Id);
            }
            catch (InvalidOperationException ex)
            {
                logger.LogError(ex, "Không thể tạo barcode cho ProductDetailId: {DetailId}", detail.Id);
                throw new CustomException(ExceptionErrorCode.UpdateFailed,
                    $"Không thể tạo barcode bổ sung cho sản phẩm chi tiết: {ex.Message}");
            }
        }

        // Xóa bớt mã vạch khi giảm số lượng, sử dụng danh sách barcode được chỉ định
        private async Task RemoveBarcodes(ProductDetail detail, int removeQuantity, List<string> barcodeCodes)
        {
            logger.LogDebug("Xóa {RemoveQuantity} barcode cho ProductDetailId: {DetailId}. BarcodesToRemove: {@BarcodeCodes}",
                removeQuantity, detail.Id, barcodeCodes);

            try
            {
                if (detail.Barcodes == null || !detail.Barcodes.Any())
                {
                    logger.LogError("Không có barcode để xóa cho ProductDetailId: {DetailId}", detail.Id);
                    throw new CustomException(ExceptionErrorCode.UpdateFailed,
                        "Không có mã vạch để xóa khi giảm số lượng.");
                }

                if (barcodeCodes == null || !barcodeCodes.Any())
                {
                    logger.LogError("Danh sách barcode cần xóa trống cho ProductDetailId: {DetailId}", detail.Id);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "Danh sách mã vạch cần xóa không được để trống khi giảm số lượng.");
                }

                if (barcodeCodes.Count != removeQuantity)
                {
                    logger.LogError("Số lượng barcode cần xóa không khớp cho ProductDetailId: {DetailId}. Yêu cầu: {RemoveQuantity}, Cung cấp: {ProvidedCount}",
                        detail.Id, removeQuantity, barcodeCodes.Count);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Số lượng mã vạch cần xóa ({barcodeCodes.Count}) không khớp với số lượng yêu cầu ({removeQuantity}).");
                }

                // Kiểm tra tất cả barcodeCodes có trong detail.Barcodes và không gắn OrderItemId
                var existingBarcodes = detail.Barcodes.Select(b => b.Code).ToList();
                var invalidCodes = barcodeCodes.Where(code => !existingBarcodes.Contains(code)).ToList();
                if (invalidCodes.Any())
                {
                    logger.LogError("Một số mã vạch không tồn tại trong ProductDetailId: {DetailId}: {InvalidCodes}",
                        detail.Id, string.Join(", ", invalidCodes));
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Một số mã vạch không tồn tại trong ProductDetail: {string.Join(", ", invalidCodes)}");
                }

                // Gọi barcodeDbService.DeleteBarcodesAsync để xóa các barcode
                await barcodeDbService.DeleteBarcodesAsync(barcodeCodes);
                logger.LogInformation("Đã xóa {Count} barcode cho ProductDetailId: {DetailId}: {Barcodes}",
                    barcodeCodes.Count, detail.Id, string.Join(", ", barcodeCodes));

                // Xóa barcode khỏi detail.Barcodes
                detail.Barcodes.RemoveAll(b => barcodeCodes.Contains(b.Code));
            }
            catch (CustomException ex)
            {
                logger.LogError(ex, "Lỗi khi xóa barcode cho ProductDetailId: {DetailId}", detail.Id);
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi không mong muốn khi xóa barcode cho ProductDetailId: {DetailId}", detail.Id);
                throw new CustomException(ExceptionErrorCode.UpdateFailed,
                    $"Không thể xóa barcode khi giảm số lượng: {ex.Message}");
            }
        }

        // Tạo mã vạch cho chi tiết sản phẩm mới
        private async Task GenerateBarcodesForNewDetail(UpdateProductDetailDto detailDto, ProductDetail detail)
        {
            logger.LogDebug("Tạo barcode cho ProductDetail mới. Quantity: {Quantity}", detailDto.Quantity);
            // Chỉ tạo mã vạch nếu Quantity > 0
            if (detailDto.Quantity > 0)
            {
                try
                {
                    // Tạo mã vạch tự động từ BarcodeDbService
                    var generatedBarcodes = await barcodeDbService.GenerateUniqueBarcodesAsync(detailDto.Quantity);

                    // Chuyển đổi thành danh sách Barcode entities
                    detail.Barcodes = generatedBarcodes
                        .Select(code => new Barcode { Code = code })
                        .ToList();
                    logger.LogInformation("Đã tạo {Count} barcode cho ProductDetail mới", generatedBarcodes.Count);
                }
                catch (InvalidOperationException ex)
                {
                    logger.LogError(ex, "Không thể tạo barcode cho ProductDetail mới");
                    throw new CustomException(ExceptionErrorCode.CreateFailed,
                        $"Không thể tạo barcode cho sản phẩm chi tiết mới: {ex.Message}");
                }
            }
            else
            {
                // Nếu Quantity = 0, không cần mã vạch
                detail.Barcodes = new List<Barcode>();
                logger.LogDebug("Không tạo barcode vì Quantity = 0");
            }
        }

        // Chuẩn hóa chuỗi: trim, normalize Unicode, và chuyển về lowercase (chỉ dùng để so sánh)
        private string NormalizeString(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            // Loại bỏ khoảng trắng đầu/cuối, chuẩn hóa Unicode về dạng FormC, và chuyển về lowercase
            var normalized = input.Trim().Normalize(NormalizationForm.FormC).ToLowerInvariant();
            logger.LogDebug("Chuẩn hóa chuỗi: {Input} -> {Normalized}", input, normalized);
            return normalized;
        }

        // Kiểm tra tính hợp lệ của AdditionalData
        private void ValidateAdditionalDataForDetail(UpdateProductDetailDto detailDto)
        {
            logger.LogDebug("Kiểm tra AdditionalData cho ProductDetailId: {DetailId}", detailDto.Id);
            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                // Kiểm tra trùng lặp Key trong cùng một ProductDetail
                var duplicates = detailDto.AdditionalData
                    .GroupBy(a => NormalizeString(a.Key))
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                if (duplicates.Any())
                {
                    var msg = string.Join(", ", duplicates);
                    logger.LogError("Key trùng lặp trong AdditionalData cho ProductDetailId: {DetailId}: {Duplicates}", detailDto.Id, msg);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Key của AdditionalData bị trùng trong 1 sản phẩm chi tiết: {msg}");
                }

                // Kiểm tra Key và Value không được để trống
                foreach (var additionalData in detailDto.AdditionalData)
                {
                    if (string.IsNullOrWhiteSpace(additionalData.Key))
                    {
                        logger.LogError("Key trống trong AdditionalData cho ProductDetailId: {DetailId}", detailDto.Id);
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Key của AdditionalData không được để trống.");
                    }

                    if (string.IsNullOrWhiteSpace(additionalData.Value))
                    {
                        logger.LogError("Value trống trong AdditionalData cho ProductDetailId: {DetailId}", detailDto.Id);
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            "Value của AdditionalData không được để trống.");
                    }
                }
            }
        }

        // Cập nhật AdditionalData cho ProductDetail và kiểm tra lại tổ hợp
        private async Task UpdateAdditionalData(UpdateProductDetailDto detailDto, ProductDetail detail, Product product, int currentDetailId)
        {
            logger.LogInformation("Cập nhật AdditionalData cho ProductDetailId: {DetailId}", detail.Id);
            logger.LogDebug("AdditionalData DTO: {@AdditionalData}", detailDto.AdditionalData);

            // Nếu ProductDetail có OrderItems, ngăn mọi thay đổi trong AdditionalData
            if (detail.OrderItems != null && detail.OrderItems.Any())
            {
                if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                {
                    var existingData = detail.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => NormalizeString(a.Value));
                    var newData = detailDto.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => NormalizeString(a.Value));
                    if (!existingData.Count.Equals(newData.Count) || existingData.Any(kvp => !newData.ContainsKey(kvp.Key) || newData[kvp.Key] != kvp.Value))
                    {
                        logger.LogError("Cố gắng cập nhật AdditionalData khi có OrderItems cho ProductDetailId: {DetailId}", detail.Id);
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Không thể cập nhật AdditionalData cho ProductDetail {detail.Id} vì đã có đơn hàng liên quan.");
                    }
                }
                logger.LogDebug("Bỏ qua cập nhật AdditionalData vì có OrderItems cho ProductDetailId: {DetailId}", detail.Id);
                return;
            }

            // Kiểm tra trùng lặp Key trong DTO trước khi xử lý
            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                var duplicates = detailDto.AdditionalData
                    .GroupBy(a => NormalizeString(a.Key))
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                if (duplicates.Any())
                {
                    var msg = string.Join(", ", duplicates);
                    logger.LogError("Key trùng lặp trong AdditionalData DTO cho ProductDetailId: {DetailId}: {Duplicates}", detail.Id, msg);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Key của AdditionalData bị trùng trong DTO: {msg}");
                }
            }

            // Cập nhật AdditionalData
            var existingAdds = detail.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => a);
            var processedKeys = new HashSet<string>();
            logger.LogDebug("Existing AdditionalData cho ProductDetailId: {DetailId}: {@ExistingData}", detail.Id, existingAdds);

            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                foreach (var addDto in detailDto.AdditionalData)
                {
                    var normalizedKey = NormalizeString(addDto.Key);
                    var originalKey = addDto.Key;
                    var originalValue = addDto.Value;

                    if (!processedKeys.Contains(normalizedKey))
                    {
                        if (existingAdds.TryGetValue(normalizedKey, out var existingAdd))
                        {
                            // Cập nhật Value của AdditionalData hiện có, giữ nguyên Id, sử dụng Value gốc
                            logger.LogDebug("Cập nhật Value cho Key: {Key}, Value mới: {Value} trong ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                            existingAdd.Value = originalValue;
                        }
                        else
                        {
                            // Thêm mới AdditionalData với Key và Value gốc
                            logger.LogDebug("Thêm mới AdditionalData: Key: {Key}, Value: {Value} cho ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                            detail.AdditionalData.Add(new AdditionalData(originalKey, originalValue));
                        }
                        processedKeys.Add(normalizedKey);
                    }
                }
            }

            // Xóa các AdditionalData không còn trong DTO nếu không có OrderItems
            var removedKeys = detail.AdditionalData
                .Where(a => !detailDto.AdditionalData.Any(dto => NormalizeString(dto.Key) == NormalizeString(a.Key)))
                .Select(a => a.Key)
                .ToList();
            if (removedKeys.Any())
            {
                logger.LogDebug("Xóa AdditionalData không còn trong DTO cho ProductDetailId: {DetailId}: {RemovedKeys}", detail.Id, string.Join(", ", removedKeys));
                detail.AdditionalData.RemoveAll(a => !detailDto.AdditionalData.Any(dto => NormalizeString(dto.Key) == NormalizeString(a.Key)));
            }

            // Kiểm tra lại tổ hợp AdditionalData trong toàn bộ Product
            if (detail.AdditionalData != null && detail.AdditionalData.Any())
            {
                var currentCombination = string.Join("|", detail.AdditionalData
                    .OrderBy(a => NormalizeString(a.Key))
                    .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));
                logger.LogDebug("Tổ hợp AdditionalData sau cập nhật cho ProductDetailId: {DetailId}: {Combination}", detail.Id, currentCombination);

                // Kiểm tra tổ hợp với các ProductDetail khác (trừ detail hiện tại)
                foreach (var otherDetail in product.ProductDetails.Where(d => d.Id != currentDetailId))
                {
                    if (otherDetail.AdditionalData != null && otherDetail.AdditionalData.Any())
                    {
                        var otherCombination = string.Join("|", otherDetail.AdditionalData
                            .OrderBy(a => NormalizeString(a.Key))
                            .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));
                        if (currentCombination == otherCombination)
                        {
                            var msg = string.Join(", ", detail.AdditionalData.Select(a => $"{a.Key}: {a.Value}"));
                            logger.LogError("Tổ hợp AdditionalData trùng sau cập nhật cho ProductDetailId: {DetailId}: {Combination}", detail.Id, msg);
                            throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                $"Tổ hợp AdditionalData '{msg}' đã tồn tại trong một ProductDetail khác sau khi cập nhật.");
                        }
                    }
                }
            }
        }

        // Xử lý hình ảnh cho ProductDetail
        private async Task ProcessProductDetailImage(UpdateProductDetailDto detailDto, ProductDetail detail, Image existingImage)
        {
            logger.LogDebug("Xử lý hình ảnh cho ProductDetailId: {DetailId}", detail.Id);
            if (string.IsNullOrEmpty(detailDto.Image?.Id))
            {
                // Xóa hình ảnh hiện có nếu có
                if (existingImage != null)
                {
                    logger.LogInformation("Xóa hình ảnh hiện có cho ProductDetailId: {DetailId}", detail.Id);
                    await imageDbService.DeleteAsync(existingImage);
                    detail.Image = null;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(detailDto.Image.Url))
                {
                    logger.LogError("URL hình ảnh trống cho ProductDetailId: {DetailId}", detail.Id);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "URL hình ảnh không được để trống.");
                }

                // Cập nhật hoặc tạo mới hình ảnh
                if (existingImage == null || existingImage.Id != detailDto.Image.Id)
                {
                    // Xóa hình ảnh cũ và tạo mới
                    if (existingImage != null)
                    {
                        logger.LogInformation("Xóa hình ảnh cũ và tạo mới cho ProductDetailId: {DetailId}", detail.Id);
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
                    logger.LogInformation("Tạo hình ảnh mới cho ProductDetailId: {DetailId}", detail.Id);
                }
                else
                {
                    // Cập nhật hình ảnh hiện có
                    logger.LogInformation("Cập nhật hình ảnh hiện có cho ProductDetailId: {DetailId}", detail.Id);
                    existingImage.UpdateImage(
                        detailDto.Image.Url,
                        detailDto.Image.ThumbUrl,
                        detailDto.Image.Name
                    );
                }
            }
        }

        // Xóa các chi tiết sản phẩm không còn trong DTO
        private async Task RemoveObsoleteDetails(UpdateProductDto dto, Product product, Dictionary<int, ProductDetail> existingDetails)
        {
            var dtoDetailIds = dto.ProductDetails.Select(d => d.Id).ToHashSet();
            var toRemoveDetails = product.ProductDetails
                .Where(d => d.Id != 0 && !dtoDetailIds.Contains(d.Id))
                .ToList();

            logger.LogInformation("Xóa {Count} ProductDetails không còn trong DTO cho ProductId: {ProductId}", toRemoveDetails.Count, dto.Id);
            foreach (var removeDetail in toRemoveDetails)
            {
                // Chỉ xóa nếu không có đơn hàng liên quan
                if (removeDetail.OrderItems == null || !removeDetail.OrderItems.Any())
                {
                    // Xóa hình ảnh liên quan nếu có
                    if (removeDetail.Image != null)
                    {
                        logger.LogInformation("Xóa hình ảnh cho ProductDetailId: {DetailId}", removeDetail.Id);
                        await imageDbService.DeleteAsync(removeDetail.Image);
                    }

                    logger.LogInformation("Xóa ProductDetailId: {DetailId}", removeDetail.Id);
                    product.ProductDetails.Remove(removeDetail);
                }
                else
                {
                    // Đánh dấu là hết hàng thay vì xóa
                    logger.LogInformation("Đánh dấu ProductDetailId: {DetailId} là hết hàng", removeDetail.Id);
                    removeDetail.UpdateStatusProductDetail(true);
                }
            }
        }
    }
}