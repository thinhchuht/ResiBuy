namespace ResiBuy.Server.Services.KafkaServices
{
    public interface IKafkaProducerService
    {
        void ProduceMessageAsync(string key, string message, string topic);
    }
}