namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomsByStatusQuery(bool IsActive, int PageNumber = 1, int PageSize = 10)
        : IRequest<ResponseModel>;

    public class GetRoomsByStatusQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomsByStatusQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomsByStatusQuery query, CancellationToken cancellationToken)
        {
            try
            {
                if (query.PageNumber < 1 || query.PageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0.");

                var paged = await roomDbService.GetRoomsByStatusAsync(query.IsActive, query.PageNumber, query.PageSize);

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