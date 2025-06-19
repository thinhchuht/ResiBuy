namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class OrderItemDto
    {
        public int ProductDetailId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
