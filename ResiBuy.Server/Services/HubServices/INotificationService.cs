namespace ResiBuy.Server.Services.HubServices;

public interface INotificationService
{
    void SendNotification(string eventName, object data, string hubGroup = null, List<string> userIds = null);
}
