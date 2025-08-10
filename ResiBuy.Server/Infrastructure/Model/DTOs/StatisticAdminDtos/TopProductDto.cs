namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class TopProductDto
    {
        public int Id { get; set; } 
        public string Name { get; set; }
        public string StoreName { get; set; }
        public int SoldQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
        public string ProductImg { get; set; }
    }
}
