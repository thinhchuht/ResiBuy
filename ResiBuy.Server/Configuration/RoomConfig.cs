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
        }
    }
}