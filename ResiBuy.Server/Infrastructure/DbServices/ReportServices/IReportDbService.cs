using ResiBuy.Server.Application.Queries.ReportQueries;

namespace ResiBuy.Server.Infrastructure.DbServices.ReportServices
{
    public interface IReportDbService : IBaseDbService<Report>
    {
        //Task<ResponseModel> ReportAsync(Report report);
        Task<PagedResult<Report>> GetAllReports(string userId, bool? isResolved, string keyword, ReportStatus reportStatus, ReportTarget reportTarget, DateTime? startDate = null, DateTime? endDate = null,  int pageNumber = 1, int pageSize = 10);
        Task<Report> GetByOrderIdAsync(Guid id);
        Task<ReportStatusCountQueryResult> GetReportStatusCountAsync();
    }
}