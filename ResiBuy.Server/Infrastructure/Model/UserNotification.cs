namespace ResiBuy.Server.Infrastructure.Model
{
    public class UserNotification
    {
        public UserNotification(string userId, Guid notificationId)
        {
            UserId = userId;
            NotificationId = notificationId;
        }

        public string UserId { get; set; }
        public Guid NotificationId { get; set; }
        public User User { get; set; }
        public Notification Notification { get; set; }
    }
}
