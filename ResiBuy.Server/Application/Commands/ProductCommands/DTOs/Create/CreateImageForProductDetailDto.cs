namespace ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Create
{
    public class CreateImageForProductDetailDto
    {
        public string Id { get; set; }
        public string Url { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
    }
}
