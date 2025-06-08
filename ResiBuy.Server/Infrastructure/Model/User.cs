namespace ResiBuy.Server.Infrastructure.Model
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
        public string IdentityNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool IsLocked { get; set; }
        public List<string> Roles { get; set; }
        public string FullName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public Cart Cart { get; set; }
        public IEnumerable<UserRoom> UserRooms { get; set; } = new List<UserRoom>();
        public IEnumerable<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
        public IEnumerable<Report> Reports { get; set; } = new List<Report>();

        public User()
        {
        }

        public User(string phoneNumber, string email, string identityNumber, DateTime dateOfBirth, string fullName, List<string> roles)
        {
            Id = Guid.NewGuid().ToString();
            PhoneNumber = phoneNumber;
            Email = email;
            IdentityNumber = identityNumber;
            DateOfBirth = dateOfBirth;
            FullName = fullName;
            Roles = roles ?? [Constants.CustomerRole];
            IsLocked = false;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
            PhoneNumberConfirmed = true;
            EmailConfirmed = true;
        }

        public static User CreateDefaultAdmin(string buildingName, string areaName)
        {
            return new User
            {
                Id = $"{Constants.DefaultAdmidId}{buildingName}{areaName}",
                Email = $"{buildingName}_{areaName}_{Constants.DefaultAdminEmail}",
                PasswordHash = CustomPasswordHasher.HashPassword(Constants.DefaultAdminPassword),
                EmailConfirmed = true,
                PhoneNumber = $"{Constants.DefaultAdminPhone}_{buildingName}_{areaName}",
                PhoneNumberConfirmed = true,
                IdentityNumber = $"{Constants.DefaultAdminIdnetityNumber}_{buildingName}_{areaName}",
                DateOfBirth = new DateTime(1990, 1, 1),
                IsLocked = false,
                Roles = [Constants.AdminRole],
                FullName = Constants.DefaultAdminFullName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
        }
    }
}
