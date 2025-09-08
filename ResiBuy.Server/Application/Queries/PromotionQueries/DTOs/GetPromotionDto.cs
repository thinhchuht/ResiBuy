using ResiBuy.Server.Application.Queries.ReportQueries;

namespace ResiBuy.Server.Application.Queries.PromotionQueries.DTOs
{
    public class GetPromotionDto
    {
        public string? Keyword { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
