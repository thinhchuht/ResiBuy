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
                return ResponseModel.FailureResponse("Product id must be greater than zero");
            var product = await ProductDbService.GetByIdAsync(query.id);
            if (product == null)
                return ResponseModel.FailureResponse("Product not found");
         
            return ResponseModel.SuccessResponse(product);

        }
    }
}
