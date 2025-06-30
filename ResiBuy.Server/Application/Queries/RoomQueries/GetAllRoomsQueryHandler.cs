namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetAllRoomsQuery() : IRequest<ResponseModel>;
    public class GetAllRoomsQueryHandler(IRoomDbService roomDbService) : IRequestHandler<GetAllRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllRoomsQuery query, CancellationToken cancellationToken)
        {
            var rooms = await roomDbService.GetAllRoomsAsync();
            return ResponseModel.SuccessResponse(rooms);
        }
    }
}
