using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Application.Queries.NotificationQueries
{
    public record CountUnreadNotificationQuery(string UserId) : IRequest<ResponseModel>;
    public class CountUnreadNotificationQueryHandler(INotificationDbService notificationDbService) : IRequestHandler<CountUnreadNotificationQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CountUnreadNotificationQuery query, CancellationToken cancellationToken)
        {
            var count = await notificationDbService.CountUnreadNotification(query.UserId);
            return ResponseModel.SuccessResponse(count);
        }
    }
}
