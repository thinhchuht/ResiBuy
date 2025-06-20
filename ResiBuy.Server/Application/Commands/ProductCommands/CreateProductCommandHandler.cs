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
                var product = new Product(dto.Name, dto.Describe, dto.Discount, dto.StoreId, dto.CategoryId);

                var detailDataSets = new List<HashSet<string>>();

                foreach (var detailDto in dto.ProductDetails)
                {
                    var detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock);
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
                            return ResponseModel.ExceptionResponse($"Dữ liệu AdditionalData bị trùng trong 1 sản phẩm chi tiết: {message}");
                        }

                        dataSet = detailDto.AdditionalData
                            .Select(a => $"{a.Key}|{a.Value}")
                            .ToHashSet();

                        if (detailDataSets.Any(existing => existing.SetEquals(dataSet)))
                        {
                            var formatted = string.Join(", ", dataSet);
                            return ResponseModel.ExceptionResponse($"Dữ liệu AdditionalData bị trùng hoàn toàn giữa các sản phẩm chi tiết: {formatted}");
                        }

                        detail.AdditionalData = detailDto.AdditionalData
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }

                    if (dataSet.Count > 0)
                        detailDataSets.Add(dataSet);

                    product.ProductDetails.Add(detail);
                }

                var result = await productDbService.CreateAsync(product);
                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }


        }
    }

}
