namespace ResiBuy.Server.Infrastructure.Model
{
    public class ProductDetail
    {
        public int Id { get; set; }
        public bool IsOutOfStock { get; set; }
        public int ProductId { get; set; }
        //public int Quantity { get; set; }
        public Product Product { get; set; }
        public int Sold { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public Image Image { get; set; }
        public int Quantity { get; set; } = 0;
        public IEnumerable<CartItem> CartItems { get; set; }
        public IEnumerable<OrderItem> OrderItems { get; set; }
        public List<AdditionalData> AdditionalData { get; set; } = new List<AdditionalData>();

        public ProductDetail(decimal price, float weight, int quantity, bool isOutOfStock = false)
        {
            Price = price;
            Weight = weight;
            IsOutOfStock = isOutOfStock;
            Sold = 0;
            Quantity = quantity;
        }

        public void UpdateProductDetail(decimal price, float weight, bool isOutOfStock, int quantity)
        {
            Price = price;
            Weight = weight;
            IsOutOfStock = isOutOfStock;
            Quantity = quantity;
        }

        public void UpdateStatusProductDetail( bool isOutOfStock)
        {
            IsOutOfStock = isOutOfStock;
        }
    }

    public enum WeightCategory
    {
        Light = 1,       // Nhẹ
        Heavy = 2,       // Nặng
        VeryHeavy = 3    // Rất nặng
    }

}
