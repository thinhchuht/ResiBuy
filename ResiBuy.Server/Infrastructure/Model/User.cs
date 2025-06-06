namespace ResiBuy.Server.Infrastructure.Model
{
    public class User : IdentityUser
    {
        public string                   IdentityNumber { get; set; }
        public DateTime                 DateOfBirth    { get; set; }
        public bool                     IsLocked       { get; set; }
        public List<string>             Roles          { get; set; }
        public string                   FullName       { get; set; }
        public DateTime                 CreatedAt      { get; set; }
        public DateTime                 UpdatedAt      { get; set; }
        public Cart                     Cart           { get; set; }
        public IEnumerable<UserRoom>    UserRooms      { get; set; } = new List<UserRoom>();
        public IEnumerable<UserVoucher> UserVouchers   { get; set; } = new List<UserVoucher>();
        public IEnumerable<Report>      Reports        { get; set; } = new List<Report>();
        public User()
        {
            
        }

        public User(string userName, string email, string identityNumber, DateTime dateOfBirth, string fullName, List<string> roles)
        {
            UserName             = userName;
            Email                = email;
            IdentityNumber       = identityNumber;
            DateOfBirth          = dateOfBirth;
            FullName             = fullName;
            Roles                = roles ?? [Constants.CustomerRole];
            IsLocked             = false;
            CreatedAt            = DateTime.Now;
            UpdatedAt            = DateTime.Now;
            PhoneNumberConfirmed = true;
        }

        public static User CreateDefaultAdmin(string buildingName, string areaName)
        {
            return new User
            {
                UserName             = $"{Constants.DefaultAdminUsername}_{buildingName}_{areaName}",
                Id                   = $"{Constants.DefaultAdmidId}{buildingName}{areaName}",
                Email                = $"{buildingName}_{areaName}_{Constants.DefaultAdminEmail}",
                EmailConfirmed       = true,
                PhoneNumber          = $"{Constants.DefaultAdminPhone}_{buildingName}_{areaName}",
                PhoneNumberConfirmed = true,
                IdentityNumber       = $"{Constants.DefaultAdminIdnetityNumber}_{buildingName}_{areaName}",
                DateOfBirth          = new DateTime(1990, 1, 1),
                IsLocked             = false,
                Roles                = [Constants.AdminRole],
                FullName             = Constants.DefaultAdminFullName,
                CreatedAt            = DateTime.Now,
                UpdatedAt            = DateTime.Now
            };
        }
    }
}
