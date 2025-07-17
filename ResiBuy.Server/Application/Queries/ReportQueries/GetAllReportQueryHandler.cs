using ResiBuy.Server.Infrastructure.DbServices.ReportServices;

namespace ResiBuy.Server.Application.Queries.ReportQueries
{
    public record GetAllReportQuery(string UserId) : IRequest<ResponseModel>;

    public class  GetAllReportQueryHandler(IReportDbService reportDbService)
        : IRequestHandler< GetAllReportQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle( GetAllReportQuery query, CancellationToken cancellationToken)
        {
            //var categories = await reportDbService.GetAllReports();
            return ResponseModel.SuccessResponse();
        }
    }
}
