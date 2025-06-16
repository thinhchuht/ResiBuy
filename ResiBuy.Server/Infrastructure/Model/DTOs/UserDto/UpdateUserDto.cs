namespace ResiBuy.Server.Infrastructure.Model.DTOs.UserDto
{
    public class UpdateUserDto
    {
        public string Email { get; set; }
        public IFormFile Avatar { get; set; }
        public string AvatarId { get; set; }
    }
}
