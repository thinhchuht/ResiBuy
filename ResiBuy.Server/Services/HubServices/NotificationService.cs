using ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices;

namespace ResiBuy.Server.Services.HubServices;

public class NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger, INotificationDbService notificationDbService) : INotificationService
{
    public async Task SendNotificationAsync(string eventName, object data, string hubGroup = null, List<string> userIds = null, bool shoudSave = true)
    {
        if (string.IsNullOrEmpty(hubGroup) && (userIds == null || !userIds.Any()))
            throw new ArgumentException("Either hubGroup or userIds must be provided");
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            if (userIds != null && userIds.Any())
            {
                var notiId = Guid.NewGuid();
                var notification = new Notification(notiId, [], DateTime.Now, eventName, userIds.Select(ui => new UserNotification(ui, notiId)));
                if(shoudSave) await notificationDbService.CreateAsync(notification);
                foreach (var userId in userIds)
                {
                    await hubContext.Clients.Group(userId).SendAsync(eventName, data, cts.Token);
                }
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
    }
}