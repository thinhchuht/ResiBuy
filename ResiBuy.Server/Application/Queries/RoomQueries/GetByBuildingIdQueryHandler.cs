namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomsByBuildingIdPagedQuery(Guid BuildingId, int PageNumber = 1, int PageSize = 10, bool? IsActive = null,bool? NoUsers = null)
        : IRequest<ResponseModel>;

    public class GetByBuildingIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomsByBuildingIdPagedQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomsByBuildingIdPagedQuery query,
            CancellationToken cancellationToken)
        {
            try
            {


                if (query.PageNumber < 1 || query.PageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                var paged = await roomDbService.GetRoomsByBuildingIdPagedAsync(
                  query.BuildingId,
                  query.PageNumber,
                  query.PageSize,
                  query.IsActive,
                  query.NoUsers
              );

                var result = paged.Items.Select(room => new
                {
                    room.Id,
                    room.Name,
                    room.IsActive,
                    NoUsers = room.UserRooms?.Any() == false
                });

                return ResponseModel.SuccessResponse(new PagedResult<object>(
                    result.Cast<object>().ToList(),
                    paged.TotalCount,
                    paged.PageNumber,
                    paged.PageSize));
            }
            catch (Exception ex)
            {

                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}