namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomsByNameAndBuildingQuery(Guid BuildingId, string Keyword, int PageNumber = 1, int PageSize = 10, bool? IsActive = null,
    bool? NoUsers = null)
        : IRequest<ResponseModel>;

    public class GetRoomsByNameAndBuildingQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomsByNameAndBuildingQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomsByNameAndBuildingQuery query,
            CancellationToken cancellationToken)
        {
            try
            {
                var paged = await roomDbService.SearchRoomsByNameAndBuildingAsync(
               query.BuildingId,
               query.Keyword,
               query.PageNumber,
               query.PageSize,
               query.IsActive,
               query.NoUsers
           );

                var result = paged.Items.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.IsActive
                });

                return ResponseModel.SuccessResponse(new PagedResult<object>(
                    result.Cast<object>().ToList(),
                    paged.TotalCount,
                    paged.PageNumber,
                    paged.PageSize
                ));
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
