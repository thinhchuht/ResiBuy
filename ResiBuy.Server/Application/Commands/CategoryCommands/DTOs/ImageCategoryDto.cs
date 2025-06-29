namespace ResiBuy.Server.Application.Commands.CategoryCommands.DTOs
{
    public class ImageCategoryDto
    {
        public string Id { get; set; }
        public string Url { get; set; } = null!;
        public string ThumbUrl { get; set; }
        public string Name { get; set; }
    }
}
