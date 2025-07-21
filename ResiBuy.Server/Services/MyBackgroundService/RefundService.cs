using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class RefundService(IOrderDbService orderDbService, INotificationService notificationService, ILogger<RefundService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    var nextRun = now.Date.AddDays(1);
                    var delay = nextRun - now;
                    logger.LogInformation($"Waiting {delay.TotalMinutes} minutes until next run at {nextRun:yyyy-MM-dd HH:mm:ss}");
                    await Task.Delay(delay, stoppingToken);
                    var cancelledOrders = await orderDbService.GetCancelledOrders();
                    foreach (var order in cancelledOrders)
                    {
                        try
                        {
                            order.PaymentStatus = PaymentStatus.Refunded;
                            await orderDbService.UpdateAsync(order);
                            await notificationService.SendNotificationAsync(Constants.Refunded, new { OrderId = order.Id }, Constants.NoHubGroup, [order.UserId]);
                        }
                        catch (Exception e)
                        {
                            await notificationService.SendNotificationAsync(Constants.RefundFailed, new { OrderId = order.Id }, Constants.NoHubGroup, [order.UserId]);
                            logger.LogError($"Failed to update order {order.Id}: {e.Message}");
                        }
                    }
                }
                catch (TaskCanceledException)
                {
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error in RefundService");
                }
            }
        }
    }
}
