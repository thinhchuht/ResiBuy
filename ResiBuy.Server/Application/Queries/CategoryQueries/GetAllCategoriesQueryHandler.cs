namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetAllCategoriesQuery(bool? status) : IRequest<ResponseModel>;

    public class GetAllCategoriesQueryHandler(ICategoryDbService CategoryDbService)
        : IRequestHandler<GetAllCategoriesQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllCategoriesQuery query, CancellationToken cancellationToken)
        {
            var categories = await CategoryDbService.GetAllCategoryAsync(query.status);
            return ResponseModel.SuccessResponse(categories);
        }
    }

}
 