using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Services.HubServices;

public class NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger, INotificationDbService notificationDbService) : INotificationService
{
    public void SendNotification(string eventName, object data, string hubGroup = null, List<string> userIds = null)
    {
        if (string.IsNullOrEmpty(hubGroup) && (userIds == null || !userIds.Any()))
            throw new ArgumentException("Either hubGroup or userIds must be provided");
        _ = Task.Run(async () =>
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                if (userIds != null && userIds.Any())
                {
                    foreach (var userId in userIds)
                    {
                        await hubContext.Clients.Group(userId).SendAsync(eventName, data, cts.Token);

                    }
                    var notiId = Guid.NewGuid();
                    var notification = new Notification(notiId, userIds, DateTime.UtcNow, eventName, userIds.Select(ui => new UserNotification(ui, notiId)));
                    await notificationDbService.CreateAsync(notification);
                    //await hubContext.Clients.Users(userIds).SendAsync(eventName, data, cts.Token);
                }
                if(!string.IsNullOrEmpty(hubGroup))
                {
                    await hubContext.Clients.Group(hubGroup).SendAsync(eventName, data, cts.Token);
                }
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation($"Notification was cancelled due to timeout");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error sending notification: {ex.Message}");
            }
        });
    }
}