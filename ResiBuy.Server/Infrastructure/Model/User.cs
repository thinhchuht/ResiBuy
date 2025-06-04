namespace ResiBuy.Server.Infrastructure.Model
{
    public class User : IdentityUser
    {
        public string IdentityNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool IsLocked { get; set; }
        public IEnumerable<string> Roles { get; set; }
        public string FullName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Cart Cart { get; set; }
        public IEnumerable<UserRoom> UserRooms { get; set; }
        public IEnumerable<UserVoucher> UserVouchers { get; set; }
        public IEnumerable<Report> Reports { get; set; }

        public User(string identityNumber, DateTime dateOfBirth, string fullName, IEnumerable<string> roles)
        {
            IdentityNumber = identityNumber;
            DateOfBirth = dateOfBirth;
            FullName = fullName;
            Roles = roles ?? [Constants.CustomerRole];
            IsLocked = false;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }
}
