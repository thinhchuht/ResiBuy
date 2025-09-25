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
        private readonly string[] _forbiddenWords = { "lồn", "cặc", "cắnn", "địt", "buồi" }; // Danh sách từ ngữ nhạy cảm

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
                // Đảm bảo tải ProductDetails và OrderItems trong truy vấn
                // Ví dụ (giả định EF Core):
                // var product = await dbContext.Products
                //     .Include(p => p.ProductDetails)
                //     .ThenInclude(pd => pd.OrderItems)
                //     .FirstOrDefaultAsync(p => p.Id == dto.Id);
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

            if (_forbiddenWords.Any(w => dto.Name.ToLowerInvariant().Contains(w)))
            {
                logger.LogError("Tên sản phẩm chứa từ ngữ không phù hợp: {Name}", dto.Name);
                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                    "Tên sản phẩm chứa từ ngữ không được phép.");
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
        }
        // Kiểm tra và cập nhật chi tiết sản phẩm
        private async Task ValidateAndUpdateProductDetails(UpdateProductDto dto, Product product)
        {
            logger.LogInformation("Bắt đầu xử lý {Count} ProductDetails cho ProductId: {ProductId}", dto.ProductDetails.Count, dto.Id);
            var existingDetails = product.ProductDetails.ToDictionary(d => d.Id);
            var allDataCombinations = new List<HashSet<string>>(); // Lưu tập hợp các cặp Key:Value duy nhất của các ProductDetail

            // Kiểm tra xem sản phẩm có đơn hàng hay không
            bool hasAnyOrderItems = product.ProductDetails.Any(d => d.OrderItems != null && d.OrderItems.Any());
            logger.LogDebug("Sản phẩm ProductId: {ProductId} có đơn hàng: {HasOrderItems}", dto.Id, hasAnyOrderItems);

            // Thu thập tất cả các Key hiện có từ AdditionalData của các ProductDetail
            var existingKeys = product.ProductDetails
                .SelectMany(d => d.AdditionalData)
                .Select(a => NormalizeString(a.Key))
                .Distinct()
                .ToHashSet();
            logger.LogDebug("Các Key hiện có trong AdditionalData: {Keys}", string.Join(", ", existingKeys));

            // Xử lý từng chi tiết sản phẩm từ DTO
            foreach (var detailDto in dto.ProductDetails)
            {
                logger.LogInformation("Xử lý ProductDetailId: {DetailId} (IsNew: {IsNew})", detailDto.Id, detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id));

                // Kiểm tra thông tin cơ bản của chi tiết sản phẩm
                ValidateProductDetailBasics(detailDto);

                // Kiểm tra tính hợp lệ của AdditionalData trước khi xử lý
                ValidateAdditionalDataForDetail(detailDto);

                // Kiểm tra Key mới trong AdditionalData nếu sản phẩm có đơn hàng
                if (hasAnyOrderItems && detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                {
                    var newKeys = detailDto.AdditionalData
                        .Select(a => NormalizeString(a.Key))
                        .Where(k => !existingKeys.Contains(k))
                        .ToList();
                    if (newKeys.Any())
                    {
                        logger.LogError("Không thể thêm phân loại mới cho ProductDetailId: {DetailId} vì sản phẩm đã có đơn hàng. Key mới: {NewKeys}", detailDto.Id, string.Join(", ", newKeys));
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Không thể thêm phân loại mới [{string.Join(", ", newKeys)}] vì sản phẩm đã có đơn hàng.");
                    }
                }

                // Tạo tập hợp các cặp Key:Value đã chuẩn hóa từ DTO
                var currentPairs = new HashSet<string>();
                if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                {
                    currentPairs = new HashSet<string>(detailDto.AdditionalData
                        .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));
                    logger.LogDebug("Cặp Key:Value cho ProductDetailId: {DetailId}: {Pairs}", detailDto.Id, string.Join(", ", currentPairs));
                }

                // Kiểm tra trùng lặp tổ hợp: chỉ kiểm tra trùng lặp chính xác
                foreach (var existingPairs in allDataCombinations)
                {
                    if (currentPairs.SetEquals(existingPairs))
                    {
                        var msg = string.Join(", ", detailDto.AdditionalData.Select(a => $"{a.Key}: {a.Value}"));
                        logger.LogError("Tổ hợp thuộc tính trùng lặp cho ProductDetailId: {DetailId}: {CurrentPairs}",
                            detailDto.Id, string.Join(", ", currentPairs));
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Tổ hợp AdditionalData '{msg}' trùng lặp với một ProductDetail khác.");
                    }
                }
                allDataCombinations.Add(currentPairs);

                ProductDetail detail = null;
                bool isNewDetail = detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id);

                if (!isNewDetail)
                {
                    // Cập nhật ProductDetail hiện có
                    detail = existingDetails[detailDto.Id];
                    logger.LogInformation("Cập nhật ProductDetailId: {DetailId}", detail.Id);

                    // Kiểm tra xem chi tiết có liên quan đến đơn hàng không
                    bool hasOrderItems = detail.OrderItems != null && detail.OrderItems.Any();
                    logger.LogDebug("ProductDetailId: {DetailId} có OrderItems: {HasOrderItems}, OrderItems Count: {OrderItemsCount}",
                        detail.Id, hasOrderItems, detail.OrderItems != null ? detail.OrderItems.Count() : 0);

                    // Kiểm tra và cập nhật AdditionalData
                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        var existingData = detail.AdditionalData.ToDictionary(a => a.Key, a => a.Value);
                        var newData = detailDto.AdditionalData.ToDictionary(a => a.Key, a => a.Value);
                        var currentDetailExistingKeys = existingData.Keys.OrderBy(k => k).ToList();
                        var newKeys = newData.Keys.OrderBy(k => k).ToList();

                        foreach (var addDto in detailDto.AdditionalData)
                        {
                            logger.LogDebug("Ký tự trong AdditionalData Value (Key: {Key}, Value: {Value}): {Chars}",
                                addDto.Key, addDto.Value, string.Join(", ", addDto.Value.Select(c => ((int)c).ToString("X4"))));
                        }
                        foreach (var add in detail.AdditionalData)
                        {
                            logger.LogDebug("Ký tự trong Existing AdditionalData Value (Key: {Key}, Value: {Value}): {Chars}",
                                add.Key, add.Value, string.Join(", ", add.Value.Select(c => ((int)c).ToString("X4"))));
                        }

                        if (!currentDetailExistingKeys.SequenceEqual(newKeys) || currentDetailExistingKeys.Any(k => existingData[k] != newData[k]))
                        {
                            if (hasOrderItems)
                            {
                                logger.LogError("Cố gắng cập nhật AdditionalData cho ProductDetailId: {DetailId}. Existing: {@ExistingData}, New: {@NewData}",
                                    detail.Id, existingData, newData);
                                throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                    $"Không thể cập nhật AdditionalData cho ProductDetail {detail.Id} vì đã có đơn hàng liên quan. Existing: [{string.Join(", ", existingData.Select(kvp => $"{kvp.Key}: {kvp.Value}"))}], New: [{string.Join(", ", newData.Select(kvp => $"{kvp.Key}: {kvp.Value}"))}]");
                            }
                            // Cập nhật AdditionalData nếu không có đơn hàng
                            await UpdateAdditionalData(detailDto, detail, product, detail.Id, hasAnyOrderItems);
                        }
                    }
                    else if (detail.AdditionalData.Any())
                    {
                        logger.LogError("Cố gắng xóa AdditionalData cho ProductDetailId: {DetailId}. Existing: {@ExistingData}",
                            detail.Id, detail.AdditionalData.Select(a => new { a.Key, a.Value }));
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Không thể xóa AdditionalData cho ProductDetail {detail.Id} vì đã có đơn hàng liên quan.");
                    }

                    // Cập nhật các thuộc tính cho phép
                    await ValidateAndUpdateQuantity(detailDto, detail, hasOrderItems);
                    detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);

                    // Cập nhật hình ảnh
                    await ProcessProductDetailImage(detailDto, detail, detail.Image);
                }
                else
                {
                    // Kiểm tra xem có ProductDetail hiện có nào khớp với tổ hợp AdditionalData (loại bỏ Key mới để so sánh)
                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        var newKeys = detailDto.AdditionalData
                            .Select(a => NormalizeString(a.Key))
                            .Where(k => !existingKeys.Contains(k))
                            .ToList();

                        // Tạo tập hợp các cặp Key:Value không bao gồm Key mới để so sánh
                        var matchingPairs = new HashSet<string>(detailDto.AdditionalData
                            .Where(a => !newKeys.Contains(NormalizeString(a.Key)))
                            .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));

                        // Tìm ProductDetail hiện có khớp với matchingPairs
                        foreach (var existingDetail in product.ProductDetails)
                        {
                            var existingDetailPairs = new HashSet<string>(existingDetail.AdditionalData
                                .Select(a => $"{NormalizeString(a.Key)}:{NormalizeString(a.Value)}"));
                            if (matchingPairs.SetEquals(existingDetailPairs))
                            {
                                detail = existingDetail;
                                logger.LogInformation("Tìm thấy ProductDetailId: {DetailId} khớp với tổ hợp AdditionalData", detail.Id);

                                // Kiểm tra xem ProductDetail có đơn hàng không
                                bool hasOrderItems = detail.OrderItems != null && detail.OrderItems.Any();
                                if (hasOrderItems && newKeys.Any())
                                {
                                    logger.LogError("Không thể thêm phân loại mới cho ProductDetailId: {DetailId} vì chi tiết đã có đơn hàng. Key mới: {NewKeys}", detail.Id, string.Join(", ", newKeys));
                                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                        $"Không thể thêm phân loại mới [{string.Join(", ", newKeys)}] vào ProductDetail {detail.Id} vì đã có đơn hàng.");
                                }

                                // Cập nhật AdditionalData nếu không có đơn hàng
                                await UpdateAdditionalData(detailDto, detail, product, detail.Id, hasAnyOrderItems);

                                // Cập nhật các thuộc tính khác
                                await ValidateAndUpdateQuantity(detailDto, detail, hasOrderItems);
                                detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock, detailDto.Quantity);
                                await ProcessProductDetailImage(detailDto, detail, detail.Image);
                                break;
                            }
                        }
                    }

                    // Nếu không tìm thấy ProductDetail khớp, tạo mới
                    if (detail == null)
                    {
                        // Tạo chi tiết sản phẩm mới
                        logger.LogInformation("Tạo ProductDetail mới cho ProductId: {ProductId}", dto.Id);
                        detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                        // Thiết lập AdditionalData cho chi tiết mới
                        if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                        {
                            logger.LogDebug("Thêm AdditionalData cho ProductDetail mới: {@AdditionalData}", detailDto.AdditionalData);
                            var mergedAdditionalData = detailDto.AdditionalData
                                .GroupBy(a => NormalizeString(a.Key))
                                .Select(g => g.Last())
                                .Select(a => new AdditionalData(a.Key, a.Value))
                                .ToList();
                            detail.AdditionalData = mergedAdditionalData;
                        }

                        // Xử lý hình ảnh và mã vạch
                        await ProcessProductDetailImage(detailDto, detail, null);
                        await GenerateBarcodesForNewDetail(detailDto, detail);
                        product.ProductDetails.Add(detail);
                    }
                }

                // Cập nhật existingKeys để bao gồm các Key mới từ detailDto
                if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                {
                    foreach (var key in detailDto.AdditionalData.Select(a => NormalizeString(a.Key)))
                    {
                        existingKeys.Add(key);
                    }
                }
            }

            // Xóa các chi tiết không còn trong DTO
            logger.LogInformation("Xóa các ProductDetails không còn trong DTO cho ProductId: {ProductId}", dto.Id);
            await RemoveObsoleteDetails(dto, product, existingDetails);
        }

        private async Task UpdateAdditionalData(UpdateProductDetailDto detailDto, ProductDetail detail, Product product, int currentDetailId, bool hasAnyOrderItems)
        {
            logger.LogInformation("Cập nhật AdditionalData cho ProductDetailId: {DetailId}", detail.Id);
            logger.LogDebug("AdditionalData DTO: {@AdditionalData}", detailDto.AdditionalData);

            // Hợp nhất key trùng lặp trong DTO, lấy giá trị cuối cùng
            var mergedDtoData = new Dictionary<string, UpdateAdditionalDataDto>();
            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                // Kiểm tra Key mới nếu sản phẩm có đơn hàng
                if (hasAnyOrderItems)
                {
                    var existingKeys = detail.AdditionalData
                        .Select(a => NormalizeString(a.Key))
                        .ToHashSet();
                    var newKeys = detailDto.AdditionalData
                        .Select(a => NormalizeString(a.Key))
                        .Where(k => !existingKeys.Contains(k))
                        .ToList();
                    if (newKeys.Any())
                    {
                        logger.LogError("Không thể thêm phân loại mới cho ProductDetailId: {DetailId} vì sản phẩm đã có đơn hàng. Key mới: {NewKeys}", detail.Id, string.Join(", ", newKeys));
                        throw new CustomException(ExceptionErrorCode.ValidationFailed,
                            $"Không thể thêm phân loại mới [{string.Join(", ", newKeys)}] vào ProductDetail {detail.Id} vì sản phẩm đã có đơn hàng.");
                    }
                }

                foreach (var addDto in detailDto.AdditionalData)
                {
                    var normalizedKey = NormalizeString(addDto.Key);
                    mergedDtoData[normalizedKey] = addDto; // Lấy bản ghi cuối cùng cho key trùng
                }
                logger.LogDebug("Hợp nhất AdditionalData từ DTO cho ProductDetailId: {DetailId}: {@MergedData}", detail.Id, mergedDtoData.Values);
            }

            // Cập nhật hoặc thêm mới AdditionalData
            var existingAdds = detail.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => a);
            var newAdditionalData = new List<AdditionalData>();
            var processedKeys = new HashSet<string>();

            foreach (var addDto in mergedDtoData.Values)
            {
                var normalizedKey = NormalizeString(addDto.Key);
                var originalKey = addDto.Key;
                var originalValue = addDto.Value;

                if (!processedKeys.Contains(normalizedKey))
                {
                    if (existingAdds.TryGetValue(normalizedKey, out var existingAdd))
                    {
                        // Cập nhật Value của AdditionalData hiện có, sử dụng Key/Value gốc từ DTO
                        logger.LogDebug("Cập nhật Value cho Key: {Key}, Value mới: {Value} trong ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                        existingAdd.Key = originalKey; // Cập nhật Key gốc
                        existingAdd.Value = originalValue;
                        newAdditionalData.Add(existingAdd);
                    }
                    else
                    {
                        // Thêm mới AdditionalData với Key/Value gốc
                        logger.LogDebug("Thêm mới AdditionalData: Key: {Key}, Value: {Value} cho ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                        newAdditionalData.Add(new AdditionalData(originalKey, originalValue));
                    }
                    processedKeys.Add(normalizedKey);
                }
            }

            // Xóa các AdditionalData không còn trong DTO
            var removedKeys = detail.AdditionalData
                .Where(a => !mergedDtoData.ContainsKey(NormalizeString(a.Key)))
                .Select(a => a.Key)
                .ToList();
            if (removedKeys.Any())
            {
                logger.LogDebug("Xóa AdditionalData không còn trong DTO cho ProductDetailId: {DetailId}: {RemovedKeys}", detail.Id, string.Join(", ", removedKeys));
            }

            // Cập nhật danh sách AdditionalData
            detail.AdditionalData = newAdditionalData;

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
            else if (newQuantity < currentQuantity)
            {
                // Nếu số lượng giảm, tự động chọn mã vạch để xóa
                var removeQuantity = currentQuantity - newQuantity;
                logger.LogInformation("Giảm số lượng cho ProductDetailId: {DetailId}. Xóa {RemoveQuantity} barcode", existingDetail.Id, removeQuantity);

                // Tự động chọn removeQuantity mã vạch từ danh sách hiện có
                var barcodesToRemove = existingDetail.Barcodes
                    .Take(removeQuantity)
                    .Select(b => b.Code)
                    .ToList();

                await RemoveBarcodes(existingDetail, removeQuantity, barcodesToRemove);
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
            logger.LogDebug("Tạo barcode cho ProductDetail mới. Quantity: {Quantity}, Barcodes: {@Barcodes}", detailDto.Quantity, detailDto.Barcodes);
            // Chỉ tạo mã vạch nếu Quantity > 0
            if (detailDto.Quantity > 0)
            {
                try
                {
                    // Kiểm tra barcodes trong DTO
                    if (detailDto.Barcodes != null && detailDto.Barcodes.Any(b => !string.IsNullOrWhiteSpace(b)))
                    {
                        if (detailDto.Barcodes.Count != detailDto.Quantity)
                        {
                            logger.LogError("Số lượng barcode không khớp với Quantity cho ProductDetail mới. Quantity: {Quantity}, Barcodes: {Count}",
                                detailDto.Quantity, detailDto.Barcodes.Count);
                            throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                $"Số lượng barcode ({detailDto.Barcodes.Count}) không khớp với số lượng yêu cầu ({detailDto.Quantity}).");
                        }
                        if (detailDto.Barcodes.Any(b => string.IsNullOrWhiteSpace(b)))
                        {
                            logger.LogError("Danh sách barcode chứa chuỗi rỗng hoặc không hợp lệ cho ProductDetail mới");
                            throw new CustomException(ExceptionErrorCode.ValidationFailed,
                                "Danh sách barcode chứa chuỗi rỗng hoặc không hợp lệ.");
                        }
                        detail.Barcodes = detailDto.Barcodes
                            .Select(code => new Barcode { Code = code })
                            .ToList();
                        logger.LogInformation("Sử dụng {Count} barcode từ DTO cho ProductDetail mới", detail.Barcodes.Count);
                    }
                    else
                    {
                        // Tạo mã vạch tự động từ BarcodeDbService
                        var generatedBarcodes = await barcodeDbService.GenerateUniqueBarcodesAsync(detailDto.Quantity);
                        detail.Barcodes = generatedBarcodes
                            .Select(code => new Barcode { Code = code })
                            .ToList();
                        logger.LogInformation("Đã tạo {Count} barcode cho ProductDetail mới", generatedBarcodes.Count);
                    }
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
            {
                logger.LogWarning("Chuỗi đầu vào rỗng hoặc chỉ chứa khoảng trắng trong NormalizeString: {Input}", input ?? "null");
                return input;
            }

            // Loại bỏ khoảng trắng đầu/cuối, chuẩn hóa Unicode về dạng FormC, và chuyển về lowercase
            var normalized = input.Trim().Normalize(NormalizationForm.FormC).ToLowerInvariant();
            logger.LogDebug("Chuẩn hóa chuỗi: {Input} -> {Normalized}", input, normalized);
            return normalized;
        }

        // Kiểm tra tính hợp lệ của AdditionalData
        private void ValidateAdditionalDataForDetail(UpdateProductDetailDto detailDto)
        {
            logger.LogDebug("Kiểm tra AdditionalData cho ProductDetailId: {DetailId}. AdditionalData: {@AdditionalData}", detailDto.Id, detailDto.AdditionalData);
            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                // Kiểm tra trùng lặp Key trong cùng một ProductDetail
                var duplicates = detailDto.AdditionalData
                    .GroupBy(a => NormalizeString(a.Key))
                    .Where(g => g.Count() > 1)
                    .Select(g => new
                    {
                        NormalizedKey = g.Key,
                        OriginalKeys = g.Select(x => x.Key).ToList()
                    })
                    .ToList();

                if (duplicates.Any())
                {
                    var msg = string.Join(", ", duplicates.Select(d => $"[{string.Join(", ", d.OriginalKeys)}]"));
                    logger.LogError("Key trùng lặp trong AdditionalData cho ProductDetailId: {DetailId}: {Duplicates}", detailDto.Id, msg);
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Key của AdditionalData bị trùng trong ProductDetail {detailDto.Id}: {msg}");
                }
            }
        }

        // Cập nhật AdditionalData cho ProductDetail và kiểm tra lại tổ hợp
        private async Task UpdateAdditionalData(UpdateProductDetailDto detailDto, ProductDetail detail, Product product, int currentDetailId)
        {
            logger.LogInformation("Cập nhật AdditionalData cho ProductDetailId: {DetailId}", detail.Id);
            logger.LogDebug("AdditionalData DTO: {@AdditionalData}", detailDto.AdditionalData);

            // Hợp nhất key trùng lặp trong DTO, lấy giá trị cuối cùng
            var mergedDtoData = new Dictionary<string, UpdateAdditionalDataDto>();
            if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
            {
                foreach (var addDto in detailDto.AdditionalData)
                {
                    var normalizedKey = NormalizeString(addDto.Key);
                    mergedDtoData[normalizedKey] = addDto; // Lấy bản ghi cuối cùng cho key trùng
                }
                logger.LogDebug("Hợp nhất AdditionalData từ DTO cho ProductDetailId: {DetailId}: {@MergedData}", detail.Id, mergedDtoData.Values);
            }

            // Cập nhật hoặc thêm mới AdditionalData
            var existingAdds = detail.AdditionalData.ToDictionary(a => NormalizeString(a.Key), a => a);
            var newAdditionalData = new List<AdditionalData>();
            var processedKeys = new HashSet<string>();

            foreach (var addDto in mergedDtoData.Values)
            {
                var normalizedKey = NormalizeString(addDto.Key);
                var originalKey = addDto.Key;
                var originalValue = addDto.Value;

                if (!processedKeys.Contains(normalizedKey))
                {
                    if (existingAdds.TryGetValue(normalizedKey, out var existingAdd))
                    {
                        // Cập nhật Value của AdditionalData hiện có, sử dụng Key/Value gốc từ DTO
                        logger.LogDebug("Cập nhật Value cho Key: {Key}, Value mới: {Value} trong ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                        existingAdd.Key = originalKey; // Cập nhật Key gốc
                        existingAdd.Value = originalValue;
                        newAdditionalData.Add(existingAdd);
                    }
                    else
                    {
                        // Thêm mới AdditionalData với Key/Value gốc
                        logger.LogDebug("Thêm mới AdditionalData: Key: {Key}, Value: {Value} cho ProductDetailId: {DetailId}", originalKey, originalValue, detail.Id);
                        newAdditionalData.Add(new AdditionalData(originalKey, originalValue));
                    }
                    processedKeys.Add(normalizedKey);
                }
            }

            // Xóa các AdditionalData không còn trong DTO
            var removedKeys = detail.AdditionalData
                .Where(a => !mergedDtoData.ContainsKey(NormalizeString(a.Key)))
                .Select(a => a.Key)
                .ToList();
            if (removedKeys.Any())
            {
                logger.LogDebug("Xóa AdditionalData không còn trong DTO cho ProductDetailId: {DetailId}: {RemovedKeys}", detail.Id, string.Join(", ", removedKeys));
            }

            // Cập nhật danh sách AdditionalData
            detail.AdditionalData = newAdditionalData;

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