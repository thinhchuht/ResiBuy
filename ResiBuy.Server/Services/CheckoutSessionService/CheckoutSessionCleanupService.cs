namespace ResiBuy.Server.Services.CheckoutSessionService;

public class CheckoutSessionCleanupService(
    ICheckoutSessionService sessionService,
    ILogger<CheckoutSessionCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Checkout session cleanup service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await sessionService.CleanupExpiredSessionsAsync();
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("Checkout session cleanup service stopped");
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during session cleanup");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}