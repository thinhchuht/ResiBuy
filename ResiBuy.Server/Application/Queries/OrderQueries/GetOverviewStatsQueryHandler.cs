using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetOverviewStatsQuery : IRequest<ResponseModel>;

    public class GetOverviewStatsQueryHandler(IOrderDbService orderDbService)
        : IRequestHandler<GetOverviewStatsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetOverviewStatsQuery request, CancellationToken cancellationToken)
        {
            var stats = await orderDbService.GetOverviewStatsAsync();
            return ResponseModel.SuccessResponse(stats);
        }
    }
}
