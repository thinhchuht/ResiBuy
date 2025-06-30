namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetByBuildingIdQuery(Guid Id) : IRequest<ResponseModel>;
    public class GetByBuildingIdQueryHandler(IRoomDbService roomDbService) : IRequestHandler<GetByBuildingIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetByBuildingIdQuery query, CancellationToken cancellationToken)
        {
            var buildings = await roomDbService.GetByBuildingIdAsync(query.Id);
            return ResponseModel.SuccessResponse(buildings);
        }
    }
}


