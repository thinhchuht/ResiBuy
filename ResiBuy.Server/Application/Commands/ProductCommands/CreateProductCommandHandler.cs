using Confluent.Kafka;
using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record CreateProductCommand(CreateProductDto ProductDto) : IRequest<ResponseModel>;
    public class CreateProductCommandHandler(IProductDbService productDbService) : IRequestHandler<CreateProductCommand, ResponseModel>
    {

        public async Task<ResponseModel> Handle(CreateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;

                var product = new Product( dto.Name, dto.Describe, dto.Discount, dto.StoreId, dto.CategoryId);

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên sản phẩm không được để trống.");
                var existedProduct = await productDbService.GetByNameAsync(dto.StoreId, dto.Name);
                if (existedProduct != null)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        $"Sản phẩm '{dto.Name}' đã tồn tại trong cửa hàng này.");
                }

                if (dto.StoreId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "StoreId không hợp lệ.");
                if (dto.CategoryId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "CategoryId không hợp lệ.");
                if (dto.Discount < 0)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giảm giá không được nhỏ hơn 0.");
                }

                var detailDataSets = new List<HashSet<string>>();

                foreach (var detailDto in dto.ProductDetails)
                {
                    var detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.Quantity, detailDto.IsOutOfStock);

                    if (detailDto.Price <= 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Giá sản phẩm chi tiết phải lớn hơn 0.");

                    if (detailDto.Weight < 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Trọng lượng không hợp lệ.");

                    if (detailDto.Quantity < 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số lượng không hợp lệ.");

                    if (detailDto.IsOutOfStock && detailDto.Quantity > 0)
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Sản phẩm đã hết hàng thì số lượng phải bằng 0.");


                    var dataSet = new HashSet<string>();

                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {

                        var duplicatesInSame = detailDto.AdditionalData
                            .GroupBy(a => new { a.Key, a.Value })
                            .Where(g => g.Count() > 1)
                            .Select(g => $"({g.Key.Key}, {g.Key.Value})")
                            .ToList();

                        if (duplicatesInSame.Any())
                        {
                            var message = string.Join(", ", duplicatesInSame);
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Dữ liệu AdditionalData bị trùng trong 1 sản phẩm chi tiết: {message}");
                        }

                        dataSet = detailDto.AdditionalData
                            .Select(a => $"{a.Key}|{a.Value}")
                            .ToHashSet();

                        if (detailDataSets.Any(existing => existing.SetEquals(dataSet)))
                        {
                            var formatted = string.Join(", ", dataSet);
                            throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Dữ liệu AdditionalData bị trùng hoàn toàn giữa các sản phẩm chi tiết: {formatted}");
                        }

                        detail.AdditionalData = detailDto.AdditionalData
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }

                    if (dataSet.Count > 0)
                        detailDataSets.Add(dataSet);

                    if (detailDto.Image != null && !string.IsNullOrEmpty(detailDto.Image.Id))
                    {
                        var image = new Image();
                        image.CreateImage(
                            detailDto.Image.Id,
                            detailDto.Image.Url,
                            detailDto.Image.ThumbUrl,
                            detailDto.Image.Name
                        );

                        detail.Image = image;

                    }


                    product.ProductDetails.Add(detail);
                }

                var result = await productDbService.CreateAsync(product);

                if (result == null) 
                    throw new CustomException(ExceptionErrorCode.CreateFailed, "Không thể tạo sản phẩm mới. Vui lòng kiểm tra lại dữ liệu.");

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }


        }
    }

}
