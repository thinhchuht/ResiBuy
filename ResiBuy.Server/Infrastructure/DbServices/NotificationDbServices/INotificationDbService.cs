namespace ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices
{
    public interface INotificationDbService : IBaseDbService<Notification>
    {
        Task<PagedResult<Notification>> GetAllNotifications(string userId,int pageNumber = 1, int pageSize = 10);
        Task<ResponseModel> ReadNotify(Guid notificationId, string userId);
    }
}