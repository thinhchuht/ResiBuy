namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class RegisterDTO
    {
        public string       Email          { get; set; }
        public string       PhoneNumber    { get; set; }
        public string       Password       { get; set; }
        public string       FullName       { get; set; }
        public DateTime     DateOfBirth    { get; set; }
        public string       IdentityNumber { get; set; }
        public IEnumerable<string> Roles          { get; set; }
        public IEnumerable<Guid> RoomIds        { get; set; }   
    }
}
