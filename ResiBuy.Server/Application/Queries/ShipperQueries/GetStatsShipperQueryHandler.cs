namespace ResiBuy.Server.Application.Queries.ShipperQueries
{
    public record GetStatsShipperQuery() : IRequest<ResponseModel>;
    public class GetStatsShipperQueryHandler : IRequestHandler<GetStatsShipperQuery, ResponseModel>
    {
        private readonly IShipperDbService _shipperDbService;

        public GetStatsShipperQueryHandler(IShipperDbService shipperDbService)
        {
            _shipperDbService = shipperDbService;
        }

        public async Task<ResponseModel> Handle(GetStatsShipperQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var onlineTrue = await _shipperDbService.CountShippersByOnlineStatusAsync(true);
                var onlineFalse = await _shipperDbService.CountShippersByOnlineStatusAsync(false);

                var shippingTrue = await _shipperDbService.CountShippersByShippingStatusAsync(true);
                var shippingFalse = await _shipperDbService.CountShippersByShippingStatusAsync(false);

                var totalReportCount = await _shipperDbService.SumShipperReportCountAsync();

                return ResponseModel.SuccessResponse(new
                {
                    OnlineTrue = onlineTrue,
                    OnlineFalse = onlineFalse,
                    ShippingTrue = shippingTrue,
                    ShippingFalse = shippingFalse,
                    TotalReportCount = totalReportCount
                });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}