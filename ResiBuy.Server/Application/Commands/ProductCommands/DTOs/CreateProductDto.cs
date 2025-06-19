namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs
{
    public class CreateProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describe { get; set; }
        public int Discount { get; set; }
        public Guid StoreId { get; set; }
        public Guid CategoryId { get; set; }
        public List<CreateProductDetailDto> ProductDetails { get; set; } = new();
    }
}
