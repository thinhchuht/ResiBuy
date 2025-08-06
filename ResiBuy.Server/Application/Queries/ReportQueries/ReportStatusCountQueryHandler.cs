using ResiBuy.Server.Infrastructure.DbServices.ReportServices;

namespace ResiBuy.Server.Application.Queries.ReportQueries
{
    public record ReportStatusCountQuery : IRequest<ResponseModel>;

    public class ReportStatusCountQueryHandler(IReportDbService reportDbService)
        : IRequestHandler<ReportStatusCountQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(ReportStatusCountQuery query, CancellationToken cancellationToken)
        {
            var count = await reportDbService.GetReportStatusCountAsync();
            return ResponseModel.SuccessResponse(count);
        }
    }
}

