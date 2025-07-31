namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ProductDetailDto
    {
        public int Id { get; set; }
        public bool IsOutOfStock { get; set; }
        public int ProductId { get; set; }
        public int Sold { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public Image Image { get; set; }
        public int Quantity { get; set; } = 0;
        public List<AdditionalData> AdditionalData { get; set; } = new List<AdditionalData>();
        public List<Review> Reviews { get; set; }

        public ProductDetailDto(int id, bool isOutOfStock, int productId, int sold, decimal price, float weight, Image image, int quantity, List<AdditionalData> additionalData, List<Review> reviews)
        {
            Id = id;
            IsOutOfStock = isOutOfStock;
            ProductId = productId;
            Sold = sold;
            Price = price;
            Weight = weight;
            Image = image;
            Quantity = quantity;
            AdditionalData = additionalData;
            Reviews = reviews;
        }
    }
}
