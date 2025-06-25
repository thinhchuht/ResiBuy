namespace ResiBuy.Server.Services.HubServices;

public class NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger) : INotificationService
{
    public void SendNotification(string eventName, object data, string hubGroup = Constants.AllHubGroup, List<string> userIds = null)
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
                    //await hubContext.Clients.Users(userIds).SendAsync(eventName, data, cts.Token);
                }
                else
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