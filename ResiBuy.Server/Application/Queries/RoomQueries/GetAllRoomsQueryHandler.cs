namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetPagedRoomsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;

    public class GetPagedRoomsQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetPagedRoomsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetPagedRoomsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.PageNumber < 1 || query.PageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed,
                        "Số trang và số phần tử phải lớn hơn 0");

                var pagedRooms = await roomDbService.GetAllRoomsAsync(query.PageNumber, query.PageSize);

                var result = pagedRooms.Items.Select(room => new
                {
                    room.Id,
                    room.Name,
                    room.IsActive,
                    UserRooms = room.UserRooms?.Select(ur => new
                    {
                        ur.UserId,
                        ur.RoomId
                    })
                }).Cast<object>().ToList();

                return ResponseModel.SuccessResponse(new PagedResult<object>(
                    result,
                    pagedRooms.TotalCount,
                    pagedRooms.PageNumber,
                    pagedRooms.PageSize));
            }
            catch (Exception ex)
            {

                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}