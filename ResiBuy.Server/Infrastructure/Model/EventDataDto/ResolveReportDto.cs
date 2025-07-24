namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class ResolveReportDto
    {
        public ResolveReportDto(Guid id, Guid orderId, string targetId, bool isAddReportTarget, ReportTarget reportTarget, string storeName)
        {
            Id = id;
            OrderId = orderId;
            TargetId = targetId;
            IsAddReportTarget = isAddReportTarget;
            ReportTarget = reportTarget;
            StoreName = storeName;
        }

        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string TargetId { get; set; }
        public bool IsAddReportTarget { get; set; } = true;
        public ReportTarget ReportTarget { get; set; }
        public string StoreName { get; set; }
    }
}
