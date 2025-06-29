namespace ResiBuy.BackgroundTask.Services.KafkaConsumeServices;

public interface IKafkaConsumerService
{
    Task StartConsumingAsync(CancellationToken cancellationToken);
    Task StopConsumingAsync();
}