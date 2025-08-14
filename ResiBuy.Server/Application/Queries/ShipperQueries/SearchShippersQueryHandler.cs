namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record SearchShippersQuery(string? Keyword, bool? IsOnline, bool? IsLocked, int PageNumber = 1, int PageSize = 5) : IRequest<ResponseModel>;
    public class SearchShippersQueryHandler(IShipperDbService shipperDbService) : IRequestHandler<SearchShippersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(SearchShippersQuery query, CancellationToken cancellationToken)
        {
            var shippers = await shipperDbService.SearchShippersAsync(query.Keyword, query.IsOnline, query.IsLocked, query.PageNumber, query.PageSize);

            var customShippers = new
            {
                items = shippers.Items.Select(s => new
                {
                    s.Id,
                    s.IsOnline,
                    s.IsLocked,
                    s.IsShipping,
                    s.StartWorkTime,
                    s.EndWorkTime,
                    s.LastLocationId,
                    Email = s.User?.Email,
                    PhoneNumber = s.User?.PhoneNumber,
                    FullName = s.User?.FullName,
                    LastLocationName = s.LastLocation?.Name
                }),
                shippers.TotalCount,
                shippers.PageNumber,
                shippers.PageSize,
                shippers.TotalPages
            };
            return ResponseModel.SuccessResponse(customShippers);
        }
    }
}
    