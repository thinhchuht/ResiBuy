using ResiBuy.Server.Application.Queries.ReportQueries;

namespace ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos
{
    public class GetReportDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Keyword { get; set; }
        public bool? IsResolved { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ReportTarget ReportTarget { get; set; }
        public ReportStatus ReportStatus { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
