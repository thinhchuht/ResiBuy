namespace ResiBuy.Server.Application.Queries.AreaQueries
{
    public record GetAllAreasQuery(bool GetActive) : IRequest<ResponseModel>;
    public class GetAllAreasQueryHandler(IAreaDbService areaDbService) : IRequestHandler<GetAllAreasQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllAreasQuery query, CancellationToken cancellationToken)
        {
            var areas = await areaDbService.GetAllAreaAsync(query.GetActive);
            return ResponseModel.SuccessResponse(areas);
        }
    }
}
