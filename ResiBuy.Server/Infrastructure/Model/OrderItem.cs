namespace ResiBuy.Server.Infrastructure.Model
{
    public class OrderItem
    {
        public OrderItem(int quantity, decimal price, Guid orderId, int productDetailId)
        {
            ID = Guid.NewGuid();
            Quantity = quantity;
            Price = price;
            OrderId = orderId;
            ProductDetailId = productDetailId;
        }

        public Guid ID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public Guid OrderId { get; set; }
        public int ProductDetailId { get; set; }
        public Order Order { get; set; }
        public ProductDetail ProductDetail { get; set; }
    }
}
