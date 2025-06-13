using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record CreateProductCommand(ProductDto ProductDto) : IRequest<ResponseModel>;
    public class CreateProductCommandHandler(IProductDbService ProductDbService) : IRequestHandler<CreateProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var product = new Product
                {
                    Name = command.ProductDto.Name,
                    ImageUrl = command.ProductDto.ImageUrl,
                    Quantity = command.ProductDto.Quantity,
                    Describe = command.ProductDto.Describe,
                    Price = command.ProductDto.Price,
                    Weight = command.ProductDto.Weight,
                    IsOutOfStock = command.ProductDto.IsOutOfStock,
                    Discount = command.ProductDto.Discount,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    StoreId = command.ProductDto.StoreId,
                    CategoryId = command.ProductDto.CategoryId
                };
                var createCategory = await ProductDbService.CreateAsync(product);
                return ResponseModel.SuccessResponse(createCategory);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
