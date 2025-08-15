namespace ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;

public class OrderOverviewStats
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Processing { get; set; }
    public int Shipped { get; set; }
    public int Delivered { get; set; }
    public int Cancelled { get; set; }
    public int Reported { get; set; }
} 