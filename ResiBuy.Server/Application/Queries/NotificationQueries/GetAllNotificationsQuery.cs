using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Application.Queries.NotificationQueries
{
    public record GetAllNotificationsQuery(string UserId, int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;
    public class GetAllNotificationsQueryHandler(INotificationDbService notificationDbService) : IRequestHandler<GetAllNotificationsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllNotificationsQuery query, CancellationToken cancellationToken)
        {
            var pagedResult = await notificationDbService.GetAllNotifications(query.UserId, query.PageNumber, query.PageSize);
            var items = pagedResult.Items.Select(n => new NotificationQueryResult(
                n.Id,
                n.EventName,
                n.CreatedAt,
                n.ReadBy.Contains(query.UserId)
            )).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<NotificationQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize));
        }
    }
}
