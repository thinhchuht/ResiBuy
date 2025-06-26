using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateProductDetailDto
    {
        public int Id { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public bool IsOutOfStock { get; set; }
        public UpdateImageForProductDetail Image { get; set; } = new();
        public List<UpdateAdditionalDataDto> AdditionalData { get; set; } = new();
    }
}
