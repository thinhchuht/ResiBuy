namespace ResiBuy.Server.Services.HubServices;

public interface INotificationService
{
    Task SendNotificationAsync(string eventName, object data, string hubGroup = null, List<string> userIds = null, bool shoudSave = true);
}
