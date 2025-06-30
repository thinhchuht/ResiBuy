namespace ResiBuy.BackgroundTask.BackgroundServices
{
    public class DeactivateVoucherBackgroundService(IVoucherService voucherService, ILogger<DeactivateVoucherBackgroundService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("DeactivateVoucherBackgroundService started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    var nextRun = now.Date.AddDays(1);
                    var delay = nextRun - now;
                    logger.LogInformation($"Waiting {delay.TotalMinutes} minutes until next run at {nextRun:yyyy-MM-dd HH:mm:ss}");
                    await Task.Delay(delay, stoppingToken);

                    logger.LogInformation("Running DeactivateBatchVoucher job...");
                    var response = await voucherService.DeactivateBatchVoucher();
                    if (response.IsSuccess())
                        logger.LogInformation("DeactivateBatchVoucher job completed successfully.");
                    else
                        logger.LogWarning($"DeactivateBatchVoucher job failed: {response.Message}");
                }
                catch (TaskCanceledException)
                {
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error in DeactivateVoucherBackgroundService");
                }
            }
            logger.LogInformation("DeactivateVoucherBackgroundService stopped");
        }
    }
}