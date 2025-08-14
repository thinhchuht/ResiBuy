namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class TopStoreDto
    {
        public string StoreName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
