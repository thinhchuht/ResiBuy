using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetPagedProductsByCategoryIdAsync(Guid categoryId, int pageNumber, int pageSize) : IRequest<ResponseModel>;

    public class GetPagedProductsByCategoryIdHandler(ICategoryDbService CategoryDbService)
        : IRequestHandler<GetPagedProductsByCategoryIdAsync, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetPagedProductsByCategoryIdAsync query, CancellationToken cancellationToken)
        {
            if (query.categoryId == Guid.Empty)
                return ResponseModel.FailureResponse("CategoryId is required");

            var pagedResult = await CategoryDbService.GetPagedProductsByCategoryIdAsync(query.categoryId, query.pageNumber, query.pageSize);
            if (pagedResult == null)
                return ResponseModel.FailureResponse("Category not found");

            return ResponseModel.SuccessResponse(pagedResult);
        }
    }
}
