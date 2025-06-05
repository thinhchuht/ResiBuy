namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ReportDto
    {
        public Guid     Id          { get; set; }
        public string   Title       { get; set; }
        public string   Description { get; set; }
        public DateTime CreatedAt   { get; set; }
        public string   CreatedById { get; set; }
        public Guid     OrderId     { get; set; }
    }
}
