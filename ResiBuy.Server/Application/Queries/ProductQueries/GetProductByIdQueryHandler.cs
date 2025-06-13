using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdQuery(Guid id) : IRequest<ResponseModel>;

    public class GetProductByIdQueryHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetProductByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.id == Guid.Empty)
                return ResponseModel.FailureResponse("Product is required");

            var product = await ProductDbService.GetByIdAsync(query.id);
            return ResponseModel.SuccessResponse(product);
        }
    }
}
