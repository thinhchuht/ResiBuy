namespace ResiBuy.Server.Configuration
{
    public class ShipperConfig : IEntityTypeConfiguration<Shipper>
    {
        public void Configure(EntityTypeBuilder<Shipper> builder)
        {
            builder.HasKey(s => s.Id);

            // Mối quan hệ: Shipper -> User (One-to-One)
            builder.HasOne(s => s.User)
                   .WithOne()
                   .HasForeignKey<Shipper>(s => s.UserId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Mối quan hệ: Shipper -> Order (One-to-Many)
            builder.HasMany(s => s.Orders)
                   .WithOne(o => o.Shipper)
                   .HasForeignKey(o => o.ShipperId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
} 