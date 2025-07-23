namespace ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos
{
    public class ResolveReportDto
    {
        public ResolveReportDto(Guid id, Guid orderId)
        {
            Id = id;
            OrderId = orderId;
        }

        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
    }
}
