
namespace ResiBuy.Server.Application.Commands.CategoryCommands.DTOs
{
    public class CreateCategoryDto
    {
        public string Name { get; set; }
        public string Status { get; set; }
        public ImageCategoryDto Image { get; set; } = new();
    }
}
