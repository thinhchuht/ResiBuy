namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class ReportCreatedDto
    {
        public ReportCreatedDto(Guid id, string title, string description, DateTime createdAt, string createdById,ReportTarget reportTarget, string targetId, Guid orderId)
        {
            Id = id;
            Title = title;
            Description = description;
            CreatedAt = createdAt;
            CreatedById = createdById;
            ReportTarget = reportTarget;
            TargetId = targetId;
            OrderId = orderId;
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedById { get; set; }
        public ReportTarget ReportTarget { get; set; }
        public string TargetId { get; set; }
        public Guid OrderId { get; set; }

    }
}
