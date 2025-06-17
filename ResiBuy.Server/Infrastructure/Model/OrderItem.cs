namespace ResiBuy.Server.Infrastructure.Model
{
    public class OrderItem
    {
        public Guid     ID        { get; set; }
        public int      Quantity  { get; set; }
        public decimal  Price     { get; set; }
        public Guid     OrderId   { get; set; }
        public int      ProductDetailId { get; set; }
        public Order    Order     { get; set; }
        public ProductDetail ProductDetail { get; set; }
    }
}
