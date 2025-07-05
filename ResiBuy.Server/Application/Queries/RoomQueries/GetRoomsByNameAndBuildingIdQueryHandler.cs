namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomsByNameAndBuildingQuery(Guid BuildingId, string Keyword, int PageNumber = 1, int PageSize = 10)
        : IRequest<ResponseModel>;

    public class GetRoomsByNameAndBuildingQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomsByNameAndBuildingQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomsByNameAndBuildingQuery query,
            CancellationToken cancellationToken)
        {
            try
            {
                //if(string.IsNullOrWhiteSpace(query.Keyword))
                //throw new CustomException(ExceptionErrorCode.ValidationFailed, "Từ khóa tìm kiếm không được để trống.");

                var paged = await roomDbService.SearchRoomsByNameAndBuildingAsync(
                    query.BuildingId, query.Keyword, query.PageNumber, query.PageSize
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
