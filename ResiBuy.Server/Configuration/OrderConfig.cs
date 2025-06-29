namespace ResiBuy.Server.Configuration
{
    public class OrderConfig : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            // Mối quan hệ
            builder.HasOne(o => o.User)
                   .WithMany()
                   .HasForeignKey(o => o.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Store)
                   .WithMany(s => s.Orders)
                   .HasForeignKey(o => o.StoreId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.ShippingAddress)
       .WithMany(s => s.Orders)
       .HasForeignKey(o => o.ShippingAddressId)
       .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Shipper)
                   .WithMany()
                   .HasForeignKey(o => o.ShipperId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Voucher)
                   .WithMany(v => v.Orders)
                   .HasForeignKey(o => o.VoucherId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(o => o.Items)
                   .WithOne(oi => oi.Order)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
