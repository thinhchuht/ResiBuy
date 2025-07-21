namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class ReportCreatedDto
    {
        public ReportCreatedDto(Guid id, string title, string description, DateTime createdAt, string createdById, string targetId, Guid orderId)
        {
            Id = id;
            Title = title;
            Description = description;
            CreatedAt = createdAt;
            CreatedById = createdById;
            TargetId = targetId;
            OrderId = orderId;
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedById { get; set; }
        public string TargetId { get; set; }
        public Guid OrderId { get; set; }

    }
}
