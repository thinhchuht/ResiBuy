namespace ResiBuy.Server.Infrastructure.Model
{
    public class Report
    {
        public Report(string title, string description, string createdById, string targetId, Guid orderId)
        {
            Title = title;
            Description = description;
            CreatedAt = DateTime.Now;
            CreatedById = createdById;
            TargetId = targetId;
            OrderId = orderId;
        }

        public Guid       Id          { get; set; }
        public string     Title       { get; set; }
        public string     Description { get; set; }
        public DateTime   CreatedAt   { get; set; }
        public string     CreatedById { get; set; }
        public string     TargetId    { get; set; }
        public Guid       OrderId     { get; set; }
        public User       CreatedBy   { get; set; }
        public User       Target    { get; set; }
        public Order      Order       { get; set; }
    }
}
