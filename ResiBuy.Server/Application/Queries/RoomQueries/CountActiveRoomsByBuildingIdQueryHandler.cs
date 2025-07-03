namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record CountActiveRoomsByBuildingIdQuery(Guid BuildingId) : IRequest<ResponseModel>;

    public class CountActiveRoomsByBuildingIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<CountActiveRoomsByBuildingIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountActiveRoomsByBuildingIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var count = await roomDbService.CountRoomsByBuildingIdAndStatusAsync(request.BuildingId, true);
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}