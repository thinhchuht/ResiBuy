namespace ResiBuy.Server.Application.Queries.AreaQueries
{
    public record GetAllAreasQuery() : IRequest<ResponseModel>;
    public class GetAllAreasQueryHandler(IAreaService areaService) : IRequestHandler<GetAllAreasQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllAreasQuery query, CancellationToken cancellationToken)
        {
            return await areaService.GetAllAreaAsync();
        }
    }
}
