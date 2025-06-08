namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetAllRoomsQuery() : IRequest<ResponseModel>;
    public class GetAllRoomsQueryHandler(IRoomDbService RoomDbService) : IRequestHandler<GetAllRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllRoomsQuery query, CancellationToken cancellationToken)
        {
            var rooms = await RoomDbService.GetAllRoomsAsync();
            return ResponseModel.SuccessResponse(rooms);
        }
    }
}
