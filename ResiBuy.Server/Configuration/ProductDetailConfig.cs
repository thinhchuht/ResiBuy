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
        }
    }
}
