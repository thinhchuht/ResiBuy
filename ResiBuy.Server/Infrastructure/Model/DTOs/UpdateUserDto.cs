namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class UpdateUserDto
    {
        public string Id { get; set; }
        public string? Email { get; set; }
        public IFormFile? Avatar { get; set; }
        public string? AvatarId { get; set;}
    }
}
