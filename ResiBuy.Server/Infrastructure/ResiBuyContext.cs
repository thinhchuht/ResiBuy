using ResiBuy.Server.Infrastructure.Seeds;

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
        public DbSet<UserNotification> UserNotifications { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<TimeSheet> TimeSheets { get; set; }
        public DbSet<Promotion> Promotions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new UserNotificationConfig());

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

            CategorySeed.Seed(modelBuilder);

            // default admin
            var admin = new User
            {
                Id = Constants.DefaultAdmidId,
                Email = Constants.DefaultAdminEmail,
                PasswordHash = CustomPasswordHasher.HashPassword(Constants.DefaultAdminPassword),
                PhoneNumber = Constants.DefaultAdminPhone,
                IdentityNumber = Constants.DefaultAdminIdnetityNumber,
                DateOfBirth = new DateTime(1990, 1, 1),
                IsLocked = false,
                Roles = [Constants.AdminRole],
                FullName = Constants.DefaultAdminFullName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            modelBuilder.Entity<User>().HasData(admin);
            var defaultAreaId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var defaultBuildingId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var defaultRoomId = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var defaultStoreId = Guid.Parse("44444444-4444-4444-4444-444444444444");

            var area = new Area
            {
                Id = defaultAreaId,
                Name = "Default Area",
                Latitude = 21.0227,
                Longitude = 105.8363,
                IsActive = true
            };

            var building = new Building
            {
                Id = defaultBuildingId,
                Name = "Default Building",
                AreaId = defaultAreaId,
                IsActive = true
            };

            var room = new Room("Default Room", defaultBuildingId)
            {
                Id = defaultRoomId,
                IsActive = true
            };

            var store = new Store
            {
                Id = defaultStoreId,
                Name = "ResiBuy",
                Description = "Default store for ResiBuy system",
                PhoneNumber = "0123456789",
                IsLocked = false,
                IsOpen = true,
                CreatedAt = DateTime.Now,
                OwnerId = Constants.DefaultAdmidId, // gán admin làm owner
                RoomId = defaultRoomId,
                IsPayFee = false
            };

            modelBuilder.Entity<Area>().HasData(area);
            modelBuilder.Entity<Building>().HasData(building);
            modelBuilder.Entity<Room>().HasData(room);
            modelBuilder.Entity<Store>().HasData(store);
        }
    }
}
