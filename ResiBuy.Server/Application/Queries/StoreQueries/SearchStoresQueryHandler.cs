namespace ResiBuy.Server.Application.Queries.StoreQueries
{
    public record SearchStoresQuery(
       string? Keyword,
       bool? IsOpen,
       bool? IsLocked,
       bool? IsPayFee,
       int PageNumber = 1,
       int PageSize = 5
   ) : IRequest<ResponseModel>;

    // Handler
    public class SearchStoresQueryHandler(IStoreDbService _storeDbService) : IRequestHandler<SearchStoresQuery, ResponseModel>
    {
       

        public async Task<ResponseModel> Handle(SearchStoresQuery request, CancellationToken cancellationToken)
        {
            var pagedResult = await _storeDbService.SearchStoresAsync(
                request.Keyword,
                request.IsOpen,
                request.IsLocked,
                request.IsPayFee,
                request.PageNumber,
                request.PageSize
            );

            var items = pagedResult.Items.Select(s => new StoreQueryResult(
                s.Id,
                s.Name,
                s.Description,
                s.IsLocked,
                s.IsOpen,
                s.ReportCount,
                s.CreatedAt,
                s.OwnerId,
                s.PhoneNumber,
                s.IsPayFee,
                new
                {
                    Id = s.RoomId,
                    Name = s.Room.Name,
                    BuildingName = s.Room.Building.Name,
                    AreaName = s.Room.Building.Area.Name,
                }
            )).ToList();

            return ResponseModel.SuccessResponse(
                new PagedResult<StoreQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize)
            );
        }
    }
}