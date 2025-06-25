namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create
{
    public class CreateProductDetailDto
    {
        public decimal Price { get; set; }
        public WeightCategory Weight { get; set; }
        public bool IsOutOfStock { get; set; }
        public CreateImageForProductDetailDto Image { get; set; } = new();
        public List<AdditionalDataDto> AdditionalData { get; set; } = new();
    }
}
