namespace ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos
{
    public class CreateReportDto
    {
        public Guid OrderId { get; set; }
        public string UserId { get; set; }
        public string TargetId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
