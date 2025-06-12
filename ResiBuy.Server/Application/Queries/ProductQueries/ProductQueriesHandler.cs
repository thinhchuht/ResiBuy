using ResiBuy.Server.Application.Queries.CategoryQueries;
using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Application.Queries.ProductQueries
{
    public record GetProductByIdQuery(Guid id) : IRequest<ResponseModel>;
    public record GetPagedProductsAsync(int pageNumber, int pageSize) : IRequest<ResponseModel>;
    public record GetProductByIdWithStoreAsync(Guid id) : IRequest<ResponseModel>;

    public class ProductQueriesHandler(IProductDbService ProductDbService) : IRequestHandler<GetProductByIdQuery, ResponseModel>,
                                                                             IRequestHandler<GetPagedProductsAsync, ResponseModel>,
                                                                             IRequestHandler<GetProductByIdWithStoreAsync, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.id == Guid.Empty)
                return ResponseModel.FailureResponse("Product is required");
            var product = await ProductDbService.GetByIdAsync(query.id);
            return ResponseModel.SuccessResponse(product);
        }

        public async Task<ResponseModel> Handle(GetPagedProductsAsync query, CancellationToken cancellationToken)
        {
            var products = await ProductDbService.GetAllProducts(query.pageNumber, query.pageSize);
            if (products == null)
                return ResponseModel.FailureResponse("Products not found");

            return ResponseModel.SuccessResponse(products);
        }

        public async Task<ResponseModel> Handle(GetProductByIdWithStoreAsync query, CancellationToken cancellationToken)
        {
            if (query.id == Guid.Empty)
                return ResponseModel.FailureResponse("Product is required");

            var product = await ProductDbService.GetProductByIdWithStoreAsync(query.id);
            if (product == null)
                return ResponseModel.FailureResponse("Product not found");

            return ResponseModel.SuccessResponse(product);
        }
    }
}
