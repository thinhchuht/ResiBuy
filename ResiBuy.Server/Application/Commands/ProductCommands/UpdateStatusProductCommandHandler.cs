namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateStatusProductCommand(int ProductId, bool IsOutOfStock) : IRequest<ResponseModel>;
    public class UpdateStatusProductCommandHandler(IProductDbService productDbService) : IRequestHandler<UpdateStatusProductCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateStatusProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
         
                var product = await productDbService.GetByIdAsync(command.ProductId);
                if (product == null)
                {
                    throw new CustomException(ExceptionErrorCode.RepositoryError, "Sản phẩm không tồn tại");
                }

                product.UpdateStatusProduct(command.IsOutOfStock);

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
