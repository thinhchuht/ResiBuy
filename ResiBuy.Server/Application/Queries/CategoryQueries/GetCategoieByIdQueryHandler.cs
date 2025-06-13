using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetCategoieByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetCategoieByIdQueryHandler(ICategoryDbService CategoryDbService)
        : IRequestHandler<GetCategoieByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCategoieByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                return ResponseModel.FailureResponse("CategoryId is required");

            var category = await CategoryDbService.GetByIdAsync(query.Id);
            if (category == null)
                return ResponseModel.FailureResponse("Category not found");

            return ResponseModel.SuccessResponse(category);
        }
    }
}
