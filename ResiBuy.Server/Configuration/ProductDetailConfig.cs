namespace ResiBuy.Server.Configuration
{
    public class ProductDetailConfig : IEntityTypeConfiguration<ProductDetail>
    {
        public void Configure(EntityTypeBuilder<ProductDetail> builder)
        {
            builder.HasMany(pd => pd.AdditionalData)
                 .WithOne(s => s.ProductDetail)
                 .HasForeignKey(p => p.ProductDetailId)
                 .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(oi => oi.OrderItems)
                 .WithOne(p => p.ProductDetail)
                 .HasForeignKey(oi => oi.ProductDetailId)
                 .OnDelete(DeleteBehavior.Restrict); // Ngăn xóa ProductDetail nếu có OrderItem
        }
    }
}
