namespace ResiBuy.Server.Infrastructure.Model
{
    public class Report
    {
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
