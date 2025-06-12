using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetAllCategoriesQuery() : IRequest<ResponseModel>;
    public record GetCategoieByIdQuery(Guid Id) : IRequest<ResponseModel>;
    public record GetPagedProductsByCategoryIdAsync(Guid categoryId, int pageNumber, int pageSize) : IRequest<ResponseModel>;
    public class CategoryQueriesHandler(ICategoryDbService CategoryDbService) : IRequestHandler<GetAllCategoriesQuery, ResponseModel>,
                                                                                IRequestHandler<GetCategoieByIdQuery, ResponseModel>,
                                                                                IRequestHandler<GetPagedProductsByCategoryIdAsync, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllCategoriesQuery query, CancellationToken cancellationToken)
        {
            var buildings = await CategoryDbService.GetAllCategoryAsync();
            return ResponseModel.SuccessResponse(buildings);
        }

        public async Task<ResponseModel> Handle(GetCategoieByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                return ResponseModel.FailureResponse("CategoryId is required");

            var category = await CategoryDbService.GetByIdAsync(query.Id);
            if (category == null)
                return ResponseModel.FailureResponse("Category not found");

            return ResponseModel.SuccessResponse(category);
        }

        public async Task<ResponseModel> Handle(GetPagedProductsByCategoryIdAsync query, CancellationToken cancellationToken)
        {
            if (query.categoryId == Guid.Empty)
                return ResponseModel.FailureResponse("CategoryId is required");

            var category = await CategoryDbService.GetPagedProductsByCategoryIdAsync(query.categoryId, query.pageNumber, query.pageSize);
            if (category == null)
                return ResponseModel.FailureResponse("Category not found");

            return ResponseModel.SuccessResponse(category);
        }
    }

}
