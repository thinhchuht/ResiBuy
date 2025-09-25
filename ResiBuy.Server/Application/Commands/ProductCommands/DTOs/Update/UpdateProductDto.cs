using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describe { get; set; }
        public int PromotionId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid StoreId { get; set; }
        public bool IsOutOfStock { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int WarrantyMonths { get; set; } = 0;
        public List<UpdateProductDetailDto> ProductDetails { get; set; }
    }
}
