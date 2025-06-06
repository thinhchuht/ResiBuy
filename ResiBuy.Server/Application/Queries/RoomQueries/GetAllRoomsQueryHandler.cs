namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetAllRoomsQuery() : IRequest<ResponseModel>;
    public class GetAllRoomsQueryHandler(IRoomDbService RoomDbService) : IRequestHandler<GetAllRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllRoomsQuery query, CancellationToken cancellationToken)
        {
            return await RoomDbService.GetAllRoomsAsync();
        }
    }
}
