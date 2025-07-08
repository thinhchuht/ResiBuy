namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomsByUserIdQuery(string UserId) : IRequest<ResponseModel>;

    public class GetRoomsByUserIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomsByUserIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomsByUserIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var rooms = await roomDbService.GetRoomsByUserIdAsync(query.UserId);

                var result = rooms.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.IsActive,
                    r.BuildingId
                });

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
