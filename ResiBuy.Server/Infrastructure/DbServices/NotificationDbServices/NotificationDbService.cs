﻿namespace ResiBuy.Server.Infrastructure.DbServices.NotificationDbServices
{
    public class NotificationDbService : BaseDbService<Notification>, INotificationDbService
    {
        private readonly ResiBuyContext context;

        public NotificationDbService(ResiBuyContext context) : base(context)
        {
            this.context = context;
        }

        public async Task<int> CountUnreadNotification(string userId)
        {
            var notifications = await context.Notifications
                .Include(n => n.UserNotifications)
                .Where(n => n.UserNotifications.Any(un => un.UserId == userId))
                .ToListAsync();
            return notifications.Count(n => !n.ReadBy.Contains(userId));
        }

        public async Task<PagedResult<Notification>> GetAllNotifications(string userId, int pageNumber = 1, int pageSize = 10)
        {
            var query = context.Notifications
                .Include(n => n.UserNotifications)
                .Where(n => n.UserNotifications.Any(un => un.UserId == userId));

            var totalCount = await query.CountAsync();

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt) 
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Notification>(notifications, totalCount, pageNumber, pageSize);
        }

        public async Task<ResponseModel> ReadNotify( Guid notificationId, string userId)
        {
            var notification = await context.Notifications.FindAsync(notificationId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Không tồn tại thông báo");
            if (notification.ReadBy.Contains(userId))
                return ResponseModel.SuccessResponse();
            notification.ReadBy.Add(userId);
            context.Notifications.Update(notification);
            await context.SaveChangesAsync();
            return ResponseModel.SuccessResponse();
        }

        public async Task<ResponseModel> ReadAllNotify(string userId)
        {
            try
            {
                var notifications = await context.Notifications
                    .Include(n => n.UserNotifications)
                    .Where(n => !n.ReadBy.Contains(userId))
                    .Where(n => n.UserNotifications.Any(un => un.UserId == userId))
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                        notification.ReadBy.Add(userId);
                }

                context.Notifications.UpdateRange(notifications);
                await context.SaveChangesAsync();

                return ResponseModel.SuccessResponse();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
