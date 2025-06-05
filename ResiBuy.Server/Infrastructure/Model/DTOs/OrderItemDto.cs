namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class OrderItemDto
    {
        public Guid    ID        { get; set; }
        public int     Quantity  { get; set; }
        public decimal Price     { get; set; }
        public Guid    OrderId   { get; set; }
        public Guid    ProductId { get; set; }
    }
}
