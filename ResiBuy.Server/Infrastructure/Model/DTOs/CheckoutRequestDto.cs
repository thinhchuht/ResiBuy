namespace ResiBuy.Server.Infrastructure.Model.DTOs;

public class CheckoutRequestDto
{
    public List<OrderRequestDto> Orders { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}

public class OrderRequestDto
{
    public string? VoucherId { get; set; }
    public decimal TotalPrice { get; set; }
    public List<OrderItemRequestDto> Items { get; set; } = new();
    public string RoomId { get; set; } = string.Empty;
    public string AreaId { get; set; } = string.Empty;
    public string BuildingId { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class OrderItemRequestDto
{
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string ProductDetailId { get; set; } = string.Empty;
}