namespace ResiBuy.Server.Infrastructure
{
    public class ResiBuyContext : IdentityDbContext<User>
    {
        public ResiBuyContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Area>         Areas         { get; set; }
        public DbSet<Building>     Buildings     { get; set; }
        public DbSet<Room>         Rooms         { get; set; }
        public DbSet<UserRoom>     UserRooms     { get; set; }
        public DbSet<Cart>         Carts         { get; set; }
        public DbSet<CartItem>     CartItems     { get; set; }
        public DbSet<Category>     Categories    { get; set; }
        public DbSet<Order>        Orders        { get; set; }
        public DbSet<OrderItem>    OrderItems    { get; set; }
        public DbSet<Product>      Products      { get; set; }
        public DbSet<Report>       Reports       { get; set; }
        public DbSet<Shipper>      Shippers      { get; set; }
        public DbSet<Store>        Stores        { get; set; }
        public DbSet<Voucher>      Vouchers      { get; set; }
        public DbSet<UserVoucher>  UserVouchers  { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Bỏ qua các thực thể Identity không sử dụng
            modelBuilder.Ignore<IdentityRole>();
            modelBuilder.Ignore<IdentityUserRole<string>>();
            modelBuilder.Ignore<IdentityRoleClaim<string>>();
            modelBuilder.Ignore<IdentityUserClaim<string>>();
            modelBuilder.Ignore<IdentityUserLogin<string>>();
            modelBuilder.Ignore<IdentityUserToken<string>>();

            //Config cho từng bảng
            modelBuilder.ApplyConfiguration(new ReportConfig());
            modelBuilder.ApplyConfiguration(new UserConfig());
            modelBuilder.ApplyConfiguration(new UserRoomConfig());
            modelBuilder.ApplyConfiguration(new UserVoucherConfig());
            modelBuilder.ApplyConfiguration(new StoreConfig());
            modelBuilder.ApplyConfiguration(new OrderConfig());
            modelBuilder.ApplyConfiguration(new ShipperConfig());
            modelBuilder.ApplyConfiguration(new VoucherConfig());
            modelBuilder.ApplyConfiguration(new ProductConfig());

            // default admin
            var hasher = new PasswordHasher<User>();
            var admin = new User
            {
                Id                   = Constants.DefaultAdmidId,
                UserName             = Constants.DefaultAdminUsername,
                NormalizedUserName   = Constants.DefaultAdminUsername.ToUpper(),
                Email                = Constants.DefaultAdminEmail,
                NormalizedEmail      = Constants.DefaultAdminFullName,
                EmailConfirmed       = true,
                PhoneNumber          = Constants.DefaultAdminPhone,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled     = false,
                LockoutEnabled       = false,
                AccessFailedCount    = 0,
                IdentityNumber       = Constants.DefaultAdminIdnetityNumber,
                DateOfBirth          = new DateTime(1990, 1, 1),
                IsLocked             = false,
                Roles                = [Constants.AdminRole],
                FullName             = Constants.DefaultAdminFullName,
                CreatedAt            = DateTime.Now,
                UpdatedAt            = DateTime.Now
            };
            admin.PasswordHash = hasher.HashPassword(admin, Constants.DefaultAdminPassword);

            modelBuilder.Entity<User>().HasData(admin);
        }
    }
}
