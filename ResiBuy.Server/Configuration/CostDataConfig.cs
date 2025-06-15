
namespace ResiBuy.Server.Configuration
{
    public class CostDataConfig : IEntityTypeConfiguration<CostData>
    {
        public void Configure(EntityTypeBuilder<CostData> builder)
        {
            builder.HasOne(cd => cd.Product) // Specify the navigation property explicitly  
                   .WithMany(p => p.CostData)
                   .HasForeignKey(cd => cd.ProductId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Product sẽ xóa AdditionalData1  
        }
    }
}
