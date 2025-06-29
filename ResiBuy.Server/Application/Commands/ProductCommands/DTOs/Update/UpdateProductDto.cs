using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create;

namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update
{
    public class UpdateProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describe { get; set; }
        public int Discount { get; set; }
        public Guid CategoryId { get; set; }
        public bool IsOutOfStock { get; set; }
        public List<UpdateProductDetailDto> ProductDetails { get; set; }
    }
}
