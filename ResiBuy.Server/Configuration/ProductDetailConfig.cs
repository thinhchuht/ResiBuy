namespace ResiBuy.Server.Configuration
{
    public class ProductDetailConfig : IEntityTypeConfiguration<ProductDetail>
    {
        public void Configure(EntityTypeBuilder<ProductDetail> builder)
        { 
            builder.HasMany(oi => oi.OrderItems)
                 .WithOne(p => p.ProductDetail)
                 .HasForeignKey(oi => oi.ProductDetailId)
                 .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Reviews)
                   .WithOne(r => r.ProductDetail)
                   .HasForeignKey(r => r.ProductDetailId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
