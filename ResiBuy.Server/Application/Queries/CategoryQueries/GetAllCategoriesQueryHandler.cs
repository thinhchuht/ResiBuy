using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetAllCategoriesQuery() : IRequest<ResponseModel>;

    public class GetAllCategoriesQueryHandler(ICategoryDbService CategoryDbService)
        : IRequestHandler<GetAllCategoriesQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllCategoriesQuery query, CancellationToken cancellationToken)
        {
            var categories = await CategoryDbService.GetAllCategoryAsync();
            return ResponseModel.SuccessResponse(categories);
        }
    }

}
