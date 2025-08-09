using Microsoft.EntityFrameworkCore;

namespace ResiBuy.Server.Configuration
{
    public class TimeSheetConfig : IEntityTypeConfiguration<TimeSheet>
    {
        public void Configure(EntityTypeBuilder<TimeSheet> builder)
        {
            builder.HasOne(c=>c.Shipper).WithMany(s=>s.TimeSheets).HasForeignKey(c=>c.ShipperId);
        }
    }
}
