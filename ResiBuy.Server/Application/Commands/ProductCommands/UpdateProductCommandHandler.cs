using ResiBuy.Server.Application.Commands.ProductCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProductCommand(CreateProductDto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProductCommandHandler(IProductDbService productDbService) : IRequestHandler<UpdateProductCommand, ResponseModel>
    {

        public async Task<ResponseModel> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;

                var product = await productDbService.GetByIdAsync(dto.Id);

                if (product != null)
                {
                    product.Name = dto.Name;
                    product.Describe = dto.Describe;
                    product.Discount = dto.Discount;
                    product.StoreId = dto.StoreId;
                    product.CategoryId = dto.CategoryId;

                    foreach (var detailDto in dto.ProductDetails)
                    {

                        var detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock);

                        if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                        {
                            detail.AdditionalData = detailDto.AdditionalData
                                .Select(a => new AdditionalData(a.Key, a.Value))
                                .ToList();
                        }

                        product.ProductDetails.Add(detail);
                    }
                }

                var result = await productDbService.UpdateAsync(product);

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }

}
