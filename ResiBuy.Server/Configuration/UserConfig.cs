namespace ResiBuy.Server.Configuration
{
    public class UserConfig : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Cấu hình các mối quan hệ
            builder.HasOne(u => u.Cart)
                   .WithOne(c => c.User)
                   .HasForeignKey<Cart>(c => c.UserId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa User, Cart sẽ bị xóa.

            builder.HasOne(u => u.Avatar)
       .WithOne(i => i.User)
       .HasForeignKey<Image>(i => i.UserId)
       .OnDelete(DeleteBehavior.NoAction);

            builder.HasMany(u => u.Stores)
                    .WithOne(s => s.Owner)
                    .HasForeignKey(s => s.OwnerId);

            builder.HasMany(u => u.UserRooms)
                   .WithOne(ur => ur.User)
                   .HasForeignKey(ur => ur.UserId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa User, UserRooms sẽ bị xóa.

            builder.HasMany(u => u.UserVouchers)
                .WithOne(uv => uv.User)
                .HasForeignKey(uv => uv.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Xóa UserVouchers sẽ không xóa User.

            builder.HasMany(u => u.Reports)
                   .WithOne(r => r.CreatedBy)
                   .HasForeignKey(r => r.CreatedById)
                   .OnDelete(DeleteBehavior.Cascade); // Khi xóa User, tất cả Reports liên kết (có cùng CreatedById) sẽ tự động bị xóa. Xóa Report không ảnh hưởng đến User.


            builder.HasMany(u => u.Reviews)
                   .WithOne(r => r.User)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Restrict); // Khi xóa User, tất cả Reports liên kết (có cùng CreatedById) sẽ tự động bị xóa. Xóa Report không ảnh hưởng đến User.
        }
    }
}