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

        }
    }
}
