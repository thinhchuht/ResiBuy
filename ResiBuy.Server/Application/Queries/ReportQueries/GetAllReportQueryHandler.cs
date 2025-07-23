using ResiBuy.Server.Infrastructure.DbServices.ReportServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReportDtos;

namespace ResiBuy.Server.Application.Queries.ReportQueries
{
    public record GetAllReportQuery(GetReportDto Dto) : IRequest<ResponseModel>;

    public class GetAllReportQueryHandler(IReportDbService reportDbService)
        : IRequestHandler<GetAllReportQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllReportQuery query, CancellationToken cancellationToken)
        {
            var dto = query.Dto;
            var pagedResults = await reportDbService.GetAllReports(dto.UserId, dto.IsResolved, dto.Keyword, dto.ReportStatus, dto.ReportTarget, dto.StartDate, dto.EndDate,dto.PageNumber, dto.PageSize);
            var items = pagedResults.Items.Select(report => 
            new ReportQueryResult(
                report.Id,
                report.IsResolved,
                report.Title,
                report.Description,
                report.CreatedAt,
                report.CreatedById,
                report.ReportTarget,
                report.TargetId,
                report.OrderId)).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<ReportQueryResult>(items, pagedResults.TotalCount, pagedResults.PageNumber, pagedResults.PageSize));
        }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportStatus
    {
        None,
        Target,
        Created,
    } 
}
