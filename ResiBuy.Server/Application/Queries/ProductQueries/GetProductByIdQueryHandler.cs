using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdQuery(int id) : IRequest<ResponseModel>;

    public class GetProductByIdQueryHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetProductByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.id <= 0)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Product id phải lớn hơn 0");
            var product = await ProductDbService.GetByIdAsync(query.id);
            if (product == null)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tìm thấy Product");

            return ResponseModel.SuccessResponse(product);
        }
    }
}
