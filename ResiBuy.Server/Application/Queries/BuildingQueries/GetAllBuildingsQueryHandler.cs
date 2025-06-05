namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record GetAllBuildingsQuery() : IRequest<ResponseModel>;
    public class GetAllBuildingsQueryHandler(IBuildingService buildingService) : IRequestHandler<GetAllBuildingsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllBuildingsQuery query, CancellationToken cancellationToken)
        {
            return await buildingService.GetAllAsync();
        }
    }
}
