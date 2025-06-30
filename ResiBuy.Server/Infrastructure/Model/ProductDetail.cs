namespace ResiBuy.Server.Infrastructure.Model
{
    public class ProductDetail
    {
        public int Id { get; set; }
        public bool IsOutOfStock { get; set; }
        public int  ProductId { get; set; }
        public Product Product { get; set; }
        public int Sold { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public Image Image { get; set; }
        public IEnumerable<CartItem> CartItems { get; set; }
        public IEnumerable<OrderItem> OrderItems { get; set; }
        public List<AdditionalData> AdditionalData { get; set; } = new List<AdditionalData>();

        public ProductDetail(decimal price, float weight, bool isOutOfStock = false)

        {
            Price = price;
            Weight = weight;
            IsOutOfStock = isOutOfStock;
            Sold = 0;
        }

        public void UpdateProductDetail(decimal price, float weight, bool isOutOfStock)
        {
            Price = price;
            Weight = weight;
            IsOutOfStock = isOutOfStock;
        }

        public void UpdateStatusProductDetail(bool isOutOfStock)
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
