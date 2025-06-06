namespace ResiBuy.Server.Configuration
{
    public class UserVoucherConfig : IEntityTypeConfiguration<UserVoucher>
    {
        public void Configure(EntityTypeBuilder<UserVoucher> builder)
        {
            builder.HasKey(uv => new { uv.UserId, uv.VoucherId });

            builder.HasOne(uv => uv.User)
                .WithMany(u => u.UserVouchers)
                .HasForeignKey(uv => uv.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Xóa User sẽ xóa tất cả UserVouchers của User đó

            builder.HasOne(uv => uv.Voucher)
                  .WithMany(r => r.UserVouchers)
                  .HasForeignKey(uv => uv.VoucherId)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa Voucher sẽ xóa tất cả UserVouchers liên quan đến Voucher đó
        }
    }
}