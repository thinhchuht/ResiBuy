namespace ResiBuy.Server.Configuration
{
    public class RoomConfig : IEntityTypeConfiguration<Room>
    {
        public void Configure(EntityTypeBuilder<Room> builder)
        {
            // Mối quan hệ
            builder.HasMany(r => r.Orders)
                   .WithOne(o => o.ShippingAddress)
                   .HasForeignKey(r => r.ShippingAddressId)
                   .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(r => r.Stores)
                   .WithOne(o => o.Room)
                   .HasForeignKey(r => r.RoomId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}