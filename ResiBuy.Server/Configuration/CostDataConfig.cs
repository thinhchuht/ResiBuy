
namespace ResiBuy.Server.Configuration
{
    public class CostDataConfig : IEntityTypeConfiguration<CostData>
    {
        public void Configure(EntityTypeBuilder<CostData> builder)
        {
            builder.HasOne(ad1 => ad1.Product) // Specify the navigation property explicitly  
                   .WithMany(p => p.AdditionalData1)
                   .HasForeignKey(ad1 => ad1.ProductId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Product sẽ xóa AdditionalData1  
        }
    }
}
