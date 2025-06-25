namespace ResiBuy.BackgroundTask.BackgroundServices
{
    public class KafkaConsumerBackgroundService(ILogger<KafkaConsumerBackgroundService> logger, IKafkaConsumerService kafkaConsumerService) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Background service starting...");

            try
            {
                await kafkaConsumerService.StartConsumingAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("Background service operation cancelled");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in background service");
            }
            finally
            {
                await kafkaConsumerService.StopConsumingAsync();
                logger.LogInformation("Background service stopped");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Stopping background service...");
            await kafkaConsumerService.StopConsumingAsync();
            await base.StopAsync(cancellationToken);
        }
    }
}
