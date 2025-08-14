namespace ResiBuy.Server.Application.Commands.CategoryCommands.DTOs
{
    public class UpdateCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool Status { get; set; }
        public ImageCategoryDto Image { get; set; } = new();
    }
}
