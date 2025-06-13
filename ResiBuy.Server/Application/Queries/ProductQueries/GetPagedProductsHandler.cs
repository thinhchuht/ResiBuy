using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetPagedProductsAsync(int pageNumber, int pageSize) : IRequest<ResponseModel>;

    public class GetPagedProductsHandler(IProductDbService ProductDbService)
        : IRequestHandler<GetPagedProductsAsync, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetPagedProductsAsync query, CancellationToken cancellationToken)
        {
            var products = await ProductDbService.GetAllProducts(query.pageNumber, query.pageSize);
            if (products == null)
                return ResponseModel.FailureResponse("Products not found");

            return ResponseModel.SuccessResponse(products);
        }
    }
}
