using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateProductDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public WeightCategory Weight { get; set; }
        public bool IsOutOfStock { get; set; }
        public List<UpdateAdditionalDataDto> AdditionalData { get; set; } = new();
    }
}
