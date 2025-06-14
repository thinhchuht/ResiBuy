
namespace ResiBuy.Server.Configuration
{
    public class UncostDataConfig : IEntityTypeConfiguration<UncostData>
    {
        public void Configure(EntityTypeBuilder<UncostData> builder)
        {
            builder.HasOne(ad2 => ad2.CostData) // Specify the navigation property explicitly
                   .WithMany(ad1 => ad1.UncostData)
                   .HasForeignKey(ad2 => ad2.CostDataId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa UncostData1 sẽ xóa UncostData2
        }
    }
}
