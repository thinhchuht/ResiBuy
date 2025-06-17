namespace ResiBuy.Server.Infrastructure.Model.DTOs.UserDtos
{
    public class ChangePasswordDto
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
