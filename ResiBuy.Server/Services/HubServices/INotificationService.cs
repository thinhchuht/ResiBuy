namespace ResiBuy.Server.Services.HubServices;

public interface INotificationService
{
    void SendNotification(string eventName, object data, string hubGroup = Constants.AllHubGroup, List<string> userIds = null);
}
