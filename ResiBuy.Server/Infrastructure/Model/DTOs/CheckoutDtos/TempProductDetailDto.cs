namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class TempProductDetailDto
    {
        public TempProductDetailDto(int id, string name, bool isOutOfStock, float weight, decimal price, int quantity, Image image, List<AdditionalData> additionalDatas)
        {
            Id = id;
            Name = name;
            IsOutOfStock = isOutOfStock;
            Weight = weight;
            Price = price;
            Quantity = quantity;
            Image = image;
            AdditionalDatas = additionalDatas;
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsOutOfStock { get; set; }
        public float Weight { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public Image Image { get; set; }
        public List<AdditionalData> AdditionalDatas { get; set; }
    }
}
