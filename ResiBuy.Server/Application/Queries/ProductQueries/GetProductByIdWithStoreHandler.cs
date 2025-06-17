using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdWithStoreAsync(int id) : IRequest<ResponseModel>;

    public class GetProductByIdWithStoreHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetProductByIdWithStoreAsync, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdWithStoreAsync query, CancellationToken cancellationToken)
        {
            

            var product = await ProductDbService.GetProductByIdWithStoreAsync(query.id);
            if (product == null)
                return ResponseModel.FailureResponse("Product not found");

            return ResponseModel.SuccessResponse(product);
        }
    }
}
