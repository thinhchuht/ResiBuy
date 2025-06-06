namespace ResiBuy.Server.Services.KafkaServices
{
    public interface IKafkaProducerService
    {
        Task ProduceMessageAsync(string key, string message, string topic);
    }
}