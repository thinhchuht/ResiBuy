namespace ResiBuy.Server.Infrastructure.Model
{
    public class Report
    {
        public Report(string title, string description, string createdById, ReportTarget reportTarget, string targetId, Guid orderId)
        {
            Title = title;
            Description = description;
            CreatedAt = DateTime.Now;
            CreatedById = createdById;
            ReportTarget = reportTarget;
            TargetId = targetId;
            OrderId = orderId;
            IsResolved = false;
        }

        public Guid       Id          { get; set; }
        public string     Title       { get; set; }
        public string     Description { get; set; }
        public DateTime   CreatedAt   { get; set; }
        public string     CreatedById { get; set; }
        public string     TargetId    { get; set; }
        public ReportTarget ReportTarget { get; set; }
        public bool       IsResolved  { get; set; } = false;
        public Guid       OrderId     { get; set; }
        public User       CreatedBy   { get; set; }
        public Order      Order       { get; set; }
    }

}
