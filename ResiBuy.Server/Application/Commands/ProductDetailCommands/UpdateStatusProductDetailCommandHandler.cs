using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;

namespace ResiBuy.Server.Application.Commands.ProductDetailCommands
{
    public record UpdateStatusProductDetailCommand(int ProductDetailId, bool IsOutOfStock) : IRequest<ResponseModel>;
    public class UpdateStatusProductDetailCommandHandler(IProductDetailDbService productDetailDbService) : IRequestHandler<UpdateStatusProductDetailCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateStatusProductDetailCommand command, CancellationToken cancellationToken)
        {
            try
            {

                var productDetail = await productDetailDbService.GetByIdAsync(command.ProductDetailId);
                if (productDetail == null)
                {
                    throw new CustomException(ExceptionErrorCode.RepositoryError, "Sản phẩm chi tiết không tồn tại");
                }

                productDetail.UpdateStatusProductDetail(command.IsOutOfStock);

                var result = await productDetailDbService.UpdateAsync(productDetail);

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
