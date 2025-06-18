namespace ResiBuy.BackgroundTask
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IKafkaConsumerService _kafkaConsumerService;

        public Worker(ILogger<Worker> logger, IKafkaConsumerService kafkaConsumerService)
        {
            _logger = logger;
            _kafkaConsumerService = kafkaConsumerService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background service starting...");

            try
            {
                // Start consuming Kafka messages
                await _kafkaConsumerService.StartConsumingAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Background service operation cancelled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background service");
            }
            finally
            {
                await _kafkaConsumerService.StopConsumingAsync();
                _logger.LogInformation("Background service stopped");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping background service...");
            await _kafkaConsumerService.StopConsumingAsync();
            await base.StopAsync(cancellationToken);
        }
    }
}
