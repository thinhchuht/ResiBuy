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

                foreach (var detailDto in dto.ProductDetails)
                {
                    var detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock);

                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {
                        var duplicates = detailDto.AdditionalData
                            .GroupBy(a => new { a.Key, a.Value })
                            .Where(g => g.Count() > 1)
                            .Select(g => $"({g.Key.Key}, {g.Key.Value})")
                            .ToList();

                        if (duplicates.Any())
                        {
                            var duplicateMessage = string.Join(", ", duplicates);
                            return ResponseModel.FailureResponse($"Dữ liệu AdditionalData bị trùng: {duplicateMessage}");
                        }

                        detail.AdditionalData = detailDto.AdditionalData
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                    }


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
