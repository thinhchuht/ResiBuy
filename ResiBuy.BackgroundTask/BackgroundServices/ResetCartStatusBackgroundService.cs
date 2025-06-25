namespace ResiBuy.BackgroundTask.BackgroundServices
{
    public class ResetCartStatusBackgroundService(ICartService cartService, ILogger<ResetCartStatusBackgroundService> logger)  : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromSeconds(45);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("ResetCartStatusBackgroundService started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    logger.LogInformation("ResetCartStatusBackgroundService execute");
                    var response = await cartService.GetCheckingOutCarts();
                    if (response.IsSuccess())
                    {
                        var carts = response.Data as List<Cart>;
                        if (carts != null && carts.Count > 0)
                        {
                            var expiredCartIds = carts
                                .Select(c => c.Id)
                                .ToList();
                            if (expiredCartIds.Count > 0)
                            {
                                var resetResponse = await cartService.ResetStatus(expiredCartIds);
                                if (resetResponse.IsSuccess())
                                    logger.LogInformation($"Reset status for {expiredCartIds.Count} carts.");
                                else
                                    logger.LogWarning($"Failed to reset status: {resetResponse.Message}");
                            }
                        }
                    }
                    else
                    {
                        logger.LogWarning($"Failed to get checking out carts: {response.Message}");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error in ResetCartStatusBackgroundService");
                }
                await Task.Delay(Interval, stoppingToken);
            }
            logger.LogInformation("ResetCartStatusBackgroundService stopped");
        }
    }
}
