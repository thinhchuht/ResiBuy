namespace ResiBuy.Server.Infrastructure
{
    public class ResiBuyContext : DbContext
    {
        public ResiBuyContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Area> Areas { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<UserRoom> UserRooms { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Shipper> Shippers { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<AdditionalData> AdditionalDatas { get; set; }
        public DbSet<ProductDetail> ProductDetails { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Image> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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
            modelBuilder.ApplyConfiguration(new CategoryConfig());
            modelBuilder.ApplyConfiguration(new CartConfig());
            modelBuilder.ApplyConfiguration(new CartItemConfig());
            modelBuilder.ApplyConfiguration(new AdditionalDataConfig());
            modelBuilder.ApplyConfiguration(new ProductDetailConfig());
            modelBuilder.ApplyConfiguration(new OrderItemConfig());
            modelBuilder.ApplyConfiguration(new RoomConfig());
            // default admin
            var admin = new User
            {
                Id = Constants.DefaultAdmidId,
                Email = Constants.DefaultAdminEmail,
                PasswordHash = CustomPasswordHasher.HashPassword(Constants.DefaultAdminPassword),
                EmailConfirmed = true,
                PhoneNumber = Constants.DefaultAdminPhone,
                PhoneNumberConfirmed = true,
                IdentityNumber = Constants.DefaultAdminIdnetityNumber,
                DateOfBirth = new DateTime(1990, 1, 1),
                IsLocked = false,
                Roles = [Constants.AdminRole],
                FullName = Constants.DefaultAdminFullName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            modelBuilder.Entity<User>().HasData(admin);
        }
    }
}
