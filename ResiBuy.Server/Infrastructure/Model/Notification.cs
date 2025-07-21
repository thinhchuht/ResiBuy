namespace ResiBuy.Server.Infrastructure.Model
{
    public class Notification
    {
        public Notification()
        {
            
        }
        public Notification(Guid id, List<string> readBy, DateTime createdAt, string eventName, IEnumerable<UserNotification> userNotifications, string data)
        {
            Id = id;
            ReadBy = readBy ?? new List<string>();
            CreatedAt = createdAt;
            EventName = eventName;
            UserNotifications = userNotifications.ToList();
            Data = data;    
        }

        public Guid Id { get; set; }
        public List<string> ReadBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string EventName { get; set; }
        public string Data { get; set; }
        public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();

    }
}
