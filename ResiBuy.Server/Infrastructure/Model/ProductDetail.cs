namespace ResiBuy.Server.Infrastructure.Model
{
    public class ProductDetail
    {
        public int Id { get; set; }
        public bool IsOutOfStock { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Sold { get; set; }
        public decimal Price { get; set; }
        public Image Image { get; set; }
        public IEnumerable<CartItem> CartItems { get; set; }
        public IEnumerable<OrderItem> OrderItems { get; set; }
        public IEnumerable<AdditionalData> AdditionalData { get; set; } = new List<AdditionalData>();
    }
}
