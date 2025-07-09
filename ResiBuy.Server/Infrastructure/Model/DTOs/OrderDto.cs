namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid StoreId { get; set; }
        public Guid? VoucherId { get; set; }
        public string Note { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal ShippingFee { get; set; }
        public IEnumerable<OrderItemDto> Items { get; set; }

    }
}
