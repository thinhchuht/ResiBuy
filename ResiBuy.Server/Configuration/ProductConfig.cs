namespace ResiBuy.Server.Configuration
{
    public class ProductConfig : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.HasOne(p => p.Store)
                   .WithMany(s => s.Products)
                   .HasForeignKey(p => p.StoreId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Store sẽ xóa Product

            builder.HasOne(p => p.Category)
                   .WithMany(c => c.Products)
                   .HasForeignKey(p => p.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.CartItems)
                   .WithOne(ci => ci.Product)
                   .HasForeignKey(ci => ci.ProductId)
                   .OnDelete(DeleteBehavior.Restrict); // Đã cấu hình trong CartItemConfig

            builder.HasMany(p => p.OrderItems)
                   .WithOne(oi => oi.Product)
                   .HasForeignKey(oi => oi.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 