namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create
{
    public class CreateProductDetailDto
    {
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public WeightCategory Weight { get; set; }
        public bool IsOutOfStock { get; set; }
        public List<AdditionalDataDto> AdditionalData { get; set; } = new();
    }
}
