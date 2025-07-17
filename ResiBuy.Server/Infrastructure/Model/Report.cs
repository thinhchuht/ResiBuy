namespace ResiBuy.Server.Infrastructure.Model
{
    public class Report
    {
        public Report(string title, string description, string createdById, Guid orderId)
        {
            Title = title;
            Description = description;
            CreatedAt = DateTime.Now;
            CreatedById = createdById;
            OrderId = orderId;
        }

        public Guid       Id          { get; set; }
        public string     Title       { get; set; }
        public string     Description { get; set; }
        public DateTime   CreatedAt   { get; set; }
        public string     CreatedById { get; set; }
        public Guid       OrderId     { get; set; }
        public User       CreatedBy   { get; set; }
        public Order      Order       { get; set; }
    }
}
