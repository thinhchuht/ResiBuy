namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record CountRoomsByBuildingIdQuery(Guid BuildingId) : IRequest<ResponseModel>;

    public class CountRoomsByBuildingIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<CountRoomsByBuildingIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountRoomsByBuildingIdQuery request,
            CancellationToken cancellationToken)
        {
            try
            {
                var count = await roomDbService.CountByBuildingIdAsync(request.BuildingId);
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}