namespace ResiBuy.Server.Infrastructure.DbServices.ReportServices
{
    public interface IReportDbService : IBaseDbService<Report>
    {
        //Task<ResponseModel> ReportAsync(Report report);
        Task<PagedResult<Report>> GetAllReports(string userId, string keyword, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10);
    }
}