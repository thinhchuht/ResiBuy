namespace ResiBuy.Server.Configuration
{
    public class VoucherConfig : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            // Mối quan hệ
            builder.HasOne(v => v.Store)
                   .WithMany(s => s.Vouchers)
                   .HasForeignKey(v => v.StoreId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Store sẽ xóa Voucher

            builder.HasMany(v => v.UserVouchers)
                   .WithOne(uv => uv.Voucher)
                   .HasForeignKey(uv => uv.VoucherId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(v => v.Orders)
                   .WithOne(o => o.Voucher)
                   .HasForeignKey(o => o.VoucherId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 