namespace ResiBuy.Server.Infrastructure.Model.Dtos
{
    public class RegisterDto
    {
        public string Code { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdentityNumber { get; set; }
        //public List<string> Roles { get; set; }
        public IEnumerable<Guid>? RoomIds { get; set; }
}

    public class UpdateRolesDto
    {
        public List<string> Roles { get; set; }
        public RegisterShiperDto? Shipper { get; set; }
        public RegisterStoreDto? Store { get; set; }
        public  RegisterCustomerDto? Customer { get; set; }
    }
    public class RegisterShiperDto
    {
        public Guid LastLocationId { get; set; }
        public float StartWorkTime { get; set; }
        public float EndWorkTime { get; set; }
    }
    public class RegisterStoreDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhoneNumber { get; set; }
        public Guid RoomId { get; set; }
    }
    public class RegisterCustomerDto
    {
        public Guid RoomId { get; set; }
    }

}
