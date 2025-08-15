using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;

namespace ResiBuy.Server.Application.Queries.OrderQueries
{
    public record GetOverviewStatsQuery(DateTime? StartDate, DateTime? EndDate) : IRequest<ResponseModel>;

    public class GetOverviewStatsQueryHandler(IOrderDbService orderDbService)
        : IRequestHandler<GetOverviewStatsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetOverviewStatsQuery request, CancellationToken cancellationToken)
        {
            var stats = await orderDbService.GetOverviewStats(request.StartDate, request.EndDate);
            return ResponseModel.SuccessResponse(stats);
        }
    }
}
