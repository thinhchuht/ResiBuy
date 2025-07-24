
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class MonthlyPayService(IStoreDbService storeDbService, IOrderDbService orderDbService, INotificationService notificationService, ILogger<MonthlyPayService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                DateTime nextRun;
                if (now.Day < 5)
                {
                    nextRun = new DateTime(now.Year, now.Month, 5, 0, 0, 0);
                }
                else if (now.Day > 5)
                {
                    // Sang tháng sau
                    var nextMonth = now.Month == 12 ? 1 : now.Month + 1;
                    var nextYear = now.Month == 12 ? now.Year + 1 : now.Year;
                    nextRun = new DateTime(nextYear, nextMonth, 5, 0, 0, 0);
                }
                else 
                {
                    // Nếu đã qua 0h ngày 5, chỉ chạy 1 lần, sau đó chờ đến tháng sau
                    if (now.Hour == 0 && now.Minute == 0)
                    {
                        try
                        {
                            logger.LogInformation("MonthlyPayService: Running monthly job at {Time}", now);
                            // Lấy toàn bộ store
                            var stores = await storeDbService.GetAllWithOutInclude();
                            foreach (var store in stores)
                            {
                                try
                                {
                                    // Lấy doanh thu chuyển khoản ngân hàng của tháng trước
                                    int prevMonth = now.Month == 1 ? 12 : now.Month - 1;
                                    var revenue = await orderDbService.GetMonthlyBankRevenue(store.Id, prevMonth);
                                    await notificationService.SendNotificationAsync(Constants.MonthlyPaymentSettled, new MonthlyPaymentSettledDto { StoreId = store.Id, StoreName = store.Name, Revenue = revenue, PaymentMonth = prevMonth }, Constants.NoHubGroup, [store.OwnerId]);
                                    logger.LogInformation($"StoreId: {store.Id}, Revenue (BankTransfer, month {prevMonth}): {revenue:N0} VND");
                                }
                                catch (Exception ex)
                                {
                                    await notificationService.SendNotificationAsync(Constants.MonthlyPaymentSettlFailed, new MonthlyPaymentSettlFailedDto { StoreId = store.Id, StoreName = store.Name }, Constants.NoHubGroup, [store.OwnerId]);
                                    logger.LogError(ex, $"MonthlyPayService: Error getting revenue for store {store.Id}");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "MonthlyPayService: Error running monthly job");
                        }
                    }
                    // Chờ đến ngày 5 tháng sau
                    var nextMonth = now.Month == 12 ? 1 : now.Month + 1;
                    var nextYear = now.Month == 12 ? now.Year + 1 : now.Year;
                    nextRun = new DateTime(nextYear, nextMonth, 5, 0, 0, 0);
                }
                var delay = nextRun - now;
                logger.LogInformation("MonthlyPayService: Waiting {Delay} until next run at {NextRun}", delay, nextRun);
                try
                {
                    await Task.Delay(delay, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // Service is stopping
                    break;
                }
            }
        }
    }
}
