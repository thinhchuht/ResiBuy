using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos;

namespace ResiBuy.Server.Application.Queries.StatisticsAdminQueries
{
    public record GetOrderStatisticsQuery(DateTime StartTime, DateTime EndTime) : IRequest<StatisticResponse>;

    public class GetStatisticsQueryHandler(IOrderDbService orderDbService) : IRequestHandler<GetOrderStatisticsQuery, StatisticResponse>
    {
        public async Task<StatisticResponse> Handle(GetOrderStatisticsQuery request, CancellationToken cancellationToken)

        {
            return await orderDbService.GetOrderStatisticsAsync(request.StartTime, request.EndTime);
        }
    }
}