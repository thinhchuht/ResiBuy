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
            var shippers = await _shipperDbService.GetAllShippersAsync(query.pageNumber,query.pageSize);
            return ResponseModel.SuccessResponse(shippers);
        }
    }
} 