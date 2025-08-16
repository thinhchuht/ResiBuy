namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record GetAllBuildingsQuery() : IRequest<ResponseModel>;
    public class GetAllBuildingsQueryHandler(IBuildingDbService BuildingDbService) : IRequestHandler<GetAllBuildingsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllBuildingsQuery query, CancellationToken cancellationToken)
        {
            var buildings = await BuildingDbService.GetAllAsync();

            var result = buildings.Select(b => new
            {
                id = b.Id,
                name = b.Name,
                isActive = b.IsActive,
                areaId = b.AreaId
       
            }).ToList();

            return ResponseModel.SuccessResponse(result);
        }
    }
}
