namespace ResiBuy.Server.Infrastructure.Model.DTOs.UserDtos
{
    public class UpdateUserDto
    {
        public string? Email { get; set; }
        public ImageDto? Avatar { get; set; }
        public string? AvatarId { get; set; }
    }
}
