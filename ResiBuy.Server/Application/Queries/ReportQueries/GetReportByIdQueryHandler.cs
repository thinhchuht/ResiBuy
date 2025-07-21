using ResiBuy.Server.Infrastructure.DbServices.ReportServices;

namespace ResiBuy.Server.Application.Queries.ReportQueries
{
    public record GetReportByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetReportByIdQueryHandler(IReportDbService reportDbService)
        : IRequestHandler<GetReportByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetReportByIdQuery query, CancellationToken cancellationToken)
        {
            var report = await reportDbService.GetByIdBaseAsync(query.Id);

            return ResponseModel.SuccessResponse(
                new ReportQueryResult(report.Id, report.Title,
                report.Description,
                report.CreatedAt,
                report.CreatedById,
                report.TargetId,
                report.OrderId));
        }
    }
}
