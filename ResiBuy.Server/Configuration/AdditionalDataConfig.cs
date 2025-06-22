
namespace ResiBuy.Server.Configuration
{
    public class AdditionalDataConfig : IEntityTypeConfiguration<AdditionalData>
    {
        public void Configure(EntityTypeBuilder<AdditionalData> builder)
        {
            builder.HasOne(cd => cd.ProductDetail) // Specify the navigation property explicitly  
                            .WithMany(p => p.AdditionalData)
                            .HasForeignKey(cd => cd.ProductDetailId)
                            .OnDelete(DeleteBehavior.Cascade); // Xóa Product sẽ xóa AdditionalData1  
        }
    }
}
