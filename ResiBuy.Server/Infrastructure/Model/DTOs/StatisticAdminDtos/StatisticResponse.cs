namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class StatisticResponse
    {
        public DateTime ActualStartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<DailyOrderStatisticDto> Data { get; set; }
        public ComparisonDto Comparison { get; set; }

    }
}
