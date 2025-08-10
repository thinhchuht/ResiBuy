namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class DailyOrderStatisticDto
    {
        public string Date { get; set; } 
        public decimal TotalOrderAmount { get; set; }
        public int OrderCount { get; set; }
        public int ProductQuantity { get; set; }
        public int UniqueBuyers { get; set; }
    }
}
