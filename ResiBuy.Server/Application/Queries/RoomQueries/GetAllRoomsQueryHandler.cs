namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetAllRoomsQuery() : IRequest<ResponseModel>;
    public class GetAllRoomsQueryHandler(IRoomService roomService) : IRequestHandler<GetAllRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllRoomsQuery query, CancellationToken cancellationToken)
        {
            return await roomService.GetAllRoomsAsync();
        }
    }
}
