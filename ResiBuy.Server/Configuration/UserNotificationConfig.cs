namespace ResiBuy.Server.Configuration
{
    public class UserNotificationConfig : IEntityTypeConfiguration<UserNotification>
    {
        public void Configure(EntityTypeBuilder<UserNotification> builder)
        {
            builder.HasKey(ur => new { ur.UserId, ur.NotificationId });

            builder.HasOne(ur => ur.User)
                  .WithMany(u => u.UserNotifications)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade); //Xóa User sẽ xóa UserRoom

            builder.HasOne(ur => ur.Notification)
                  .WithMany(r => r.UserNotifications)
                  .HasForeignKey(ur => ur.NotificationId)
                  .OnDelete(DeleteBehavior.Cascade); //Xóa Room sẽ xóa UserRoom
        }
    }
}
