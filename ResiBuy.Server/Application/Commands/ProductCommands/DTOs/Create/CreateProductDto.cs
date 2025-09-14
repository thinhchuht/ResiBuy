namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create
{
    public class CreateProductDto
    {
        public string Name { get; set; }
        public string Describe { get; set; }
        public int PromotionId { get; set; }
        public Guid StoreId { get; set; }
        public Guid CategoryId { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? WarrantyMonths { get; set; } // Bảo hành theo tháng
        public List<CreateProductDetailDto> ProductDetails { get; set; } = new();
    }
}
