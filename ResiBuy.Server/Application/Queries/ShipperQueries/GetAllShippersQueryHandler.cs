using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;

namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetAllShippersQuery(int pageNumber=1, int pageSize =5) : IRequest<ResponseModel>;

    public class GetAllShippersQueryHandler : IRequestHandler<GetAllShippersQuery, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public GetAllShippersQueryHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(GetAllShippersQuery query, CancellationToken cancellationToken)
        {
            var shippers = await _shipperDbService.GetAllShippersAsync(query.pageNumber, query.pageSize);

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
                    LastLocationName = s.LastLocation?.Name,
                    ReportCount= s.ReportCount
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