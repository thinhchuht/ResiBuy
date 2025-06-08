namespace ResiBuy.Server.Infrastructure.Model.Dtos
{
    public class RegisterDto
    {
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdentityNumber { get; set; }
        public List<string> Roles { get; set; }
        public IEnumerable<Guid> RoomIds { get; set; }
    }
}
