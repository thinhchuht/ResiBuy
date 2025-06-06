namespace ResiBuy.Server.Configuration
{
    public class ReportConfig : IEntityTypeConfiguration<Report>
    {
        public void Configure(EntityTypeBuilder<Report> builder)
        {
            // Mối quan hệ
            builder.HasOne(r => r.CreatedBy)
                   .WithMany(u => u.Reports)
                   .HasForeignKey(r => r.CreatedById)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa User sẽ xóa Report

            builder.HasOne(r => r.Order)
                   .WithMany(o => o.Reports) 
                   .HasForeignKey(r => r.OrderId)
                   .OnDelete(DeleteBehavior.Restrict); // Sửa thành Restrict để tránh lỗi
        }
    }
}