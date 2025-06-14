
namespace ResiBuy.Server.Configuration
{
    public class AdditionalData2Config : IEntityTypeConfiguration<AdditionalData2>
    {
        public void Configure(EntityTypeBuilder<AdditionalData2> builder)
        {
            builder.HasOne(ad2 => ad2.AdditionalData1) // Specify the navigation property explicitly
                   .WithMany(ad1 => ad1.AdditionalData2)
                   .HasForeignKey(ad2 => ad2.AdditionalData1Id)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa AdditionalData1 sẽ xóa AdditionalData2
        }
    }
}
