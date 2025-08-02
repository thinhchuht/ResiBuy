using ResiBuy.Server.Infrastructure.DbServices.ReportServices;

namespace ResiBuy.Server.Application.Queries.ReportQueries
{
    public record GetReportByOrderIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetReportByOrderIdQueryHandler(IReportDbService reportDbService)
        : IRequestHandler<GetReportByOrderIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetReportByOrderIdQuery query, CancellationToken cancellationToken)
        {
            var report = await reportDbService.GetByOrderIdAsync(query.Id);

            return ResponseModel.SuccessResponse(
                new ReportQueryResult(report.Id, report.IsResolved, report.Title,
                report.Description,
                report.CreatedAt,
                report.CreatedById,
                report.ReportTarget,
                report.TargetId,
                report.OrderId));
        }
    }
}
