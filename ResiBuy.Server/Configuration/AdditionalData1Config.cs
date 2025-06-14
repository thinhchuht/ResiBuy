
namespace ResiBuy.Server.Configuration
{
    public class AdditionalData1Config : IEntityTypeConfiguration<AdditionalData1>
    {
        public void Configure(EntityTypeBuilder<AdditionalData1> builder)
        {
            builder.HasOne(ad1 => ad1.Product) // Specify the navigation property explicitly  
                   .WithMany(p => p.AdditionalData1)
                   .HasForeignKey(ad1 => ad1.ProductId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Product sẽ xóa AdditionalData1  
        }
    }
}
