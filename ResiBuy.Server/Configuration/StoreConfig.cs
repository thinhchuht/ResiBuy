namespace ResiBuy.Server.Configuration
{
    public class StoreConfig : IEntityTypeConfiguration<Store>
    {
        public void Configure(EntityTypeBuilder<Store> builder)
        {
            // Mối quan hệ
            builder.HasOne(s => s.Owner)
                   .WithMany()
                   .HasForeignKey(s => s.OwnerId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Room)
                   .WithMany()
                   .HasForeignKey(s => s.RoomId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Products)
                   .WithOne(p => p.Store)
                   .HasForeignKey(p => p.StoreId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.Vouchers)
                   .WithOne(v => v.Store)
                   .HasForeignKey(v => v.StoreId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.HasMany(s => s.Orders)
                   .WithOne(o => o.Store)
                   .HasForeignKey(o => o.StoreId)
                   .OnDelete(DeleteBehavior.Restrict); 
        }
    }
}