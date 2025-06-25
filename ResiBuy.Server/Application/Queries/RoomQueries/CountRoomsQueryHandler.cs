namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record CountRoomsQuery() : IRequest<ResponseModel>;

    public class CountRoomsQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<CountRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountRoomsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var count = await roomDbService.CountAllAsync();
                return ResponseModel.SuccessResponse(new { Count = count });
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}