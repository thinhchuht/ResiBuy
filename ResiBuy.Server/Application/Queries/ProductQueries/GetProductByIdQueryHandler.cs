using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdQuery(int id) : IRequest<ResponseModel>;

    public class GetProductByIdQueryHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetProductByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
        {
            

            var product = await ProductDbService.GetByIdAsync(query.id);
            return ResponseModel.SuccessResponse(product);
        }
    }
}
