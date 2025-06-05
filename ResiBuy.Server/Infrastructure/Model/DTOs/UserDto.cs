namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class UserDto
    {
        public string                   Id             { get; set; }
        public string                   IdentityNumber { get; set; }
        public DateTime                 DateOfBirth    { get; set; }
        public bool                     IsLocked       { get; set; }
        public IEnumerable<string>      Roles          { get; set; }
        public string                   FullName       { get; set; }
        public DateTime                 CreatedAt      { get; set; }
        public DateTime                 UpdatedAt      { get; set; }
        public Cart                     Cart           { get; set; }
        public IEnumerable<UserRoom>    UserRooms      { get; set; }
        public IEnumerable<UserVoucher> UserVouchers   { get; set; }
        public IEnumerable<Report>      Reports        { get; set; }

        public UserDto(string id, string identityNumber, DateTime dateOfBirth, bool isLocked, IEnumerable<string> roles, string fullName, DateTime createdAt, DateTime updatedAt, Cart cart, IEnumerable<UserRoom> userRooms, IEnumerable<UserVoucher> userVouchers, IEnumerable<Report> reports)
        {
            Id             = id;
            IdentityNumber = identityNumber;
            DateOfBirth    = dateOfBirth;
            IsLocked       = isLocked;
            Roles          = roles;
            FullName       = fullName;
            CreatedAt      = createdAt;
            UpdatedAt      = updatedAt;
            Cart           = cart;
            UserRooms      = userRooms;
            UserVouchers   = userVouchers;
            Reports        = reports;
        }
    }
}
