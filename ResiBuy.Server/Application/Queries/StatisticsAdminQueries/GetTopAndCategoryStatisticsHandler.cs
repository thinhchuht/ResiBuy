using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos;

namespace ResiBuy.Server.Application.Queries.StatisticsAdminQueries
{
    public record GetTopAndCategoryStatisticsQuery(DateTime StartTime, DateTime EndTime)
         : IRequest<(List<TopStatisticsResponse> TopStatistics, List<CategoryPercentageDto> CategoryPercentages)>;

    public class GetTopAndCategoryStatisticsHandler(IOrderDbService orderDbService, ICategoryDbService categoryDbService) : IRequestHandler<GetTopAndCategoryStatisticsQuery, (List<TopStatisticsResponse>, List<CategoryPercentageDto>)>
    {




        public async Task<(List<TopStatisticsResponse>, List<CategoryPercentageDto>)> Handle(GetTopAndCategoryStatisticsQuery request, CancellationToken cancellationToken)
        {
            var topStatistics = await orderDbService.GetTopStatisticsAsync(request.StartTime, request.EndTime);
            var categoryPercentages = await categoryDbService.GetCategoryPercentagesAsync();
            return (new List<TopStatisticsResponse> { topStatistics }, categoryPercentages);
        }
    }
}