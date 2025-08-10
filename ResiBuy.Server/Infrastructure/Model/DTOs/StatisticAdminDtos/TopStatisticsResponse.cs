namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class TopStatisticsResponse
    {
        public DateTime ActualStartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<TopBuyerDto> TopBuyers { get; set; }
        public List<TopProductDto> TopProducts { get; set; }
        public List<TopStoreDto> TopStores { get; set; }
    }
}
