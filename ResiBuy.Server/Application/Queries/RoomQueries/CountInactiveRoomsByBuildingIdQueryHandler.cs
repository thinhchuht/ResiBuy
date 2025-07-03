namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record CountInactiveRoomsByBuildingIdQuery(Guid BuildingId) : IRequest<ResponseModel>;

    public class CountInactiveRoomsByBuildingIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<CountInactiveRoomsByBuildingIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountInactiveRoomsByBuildingIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var count = await roomDbService.CountRoomsByBuildingIdAndStatusAsync(request.BuildingId, false);
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}