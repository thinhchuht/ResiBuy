namespace ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos
{
    public class TopBuyerDto
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalValue { get; set; }
        public string Avatar { get; set; }
    }
}
