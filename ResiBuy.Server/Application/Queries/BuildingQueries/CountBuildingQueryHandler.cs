using ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices;

namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record CountBuildingsQuery() : IRequest<ResponseModel>;

    public class CountBuildingQueryHandler(IBuildingDbService BuildingDbService) : IRequestHandler<CountBuildingsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountBuildingsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var count = await BuildingDbService.CountAsync();
                return ResponseModel.SuccessResponse(count);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
