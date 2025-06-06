namespace ResiBuy.Server.Services.KafkaServices;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public KafkaProducerService(IOptions<KafkaSettings> kafkaSettings)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = kafkaSettings.Value.BootstrapServers
        };

        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    public Task ProduceMessageAsync(string topic, string key, string message)
    {
        return Task.Run(async () =>
        {
            try
            {
                var messageStr = message;
                if (!message.StartsWith("{") && !message.StartsWith("["))
                {
                    messageStr = JsonSerializer.Serialize(message, _jsonOptions);
                }

                var deliveryResult = await _producer.ProduceAsync(
                    topic,
                    new Message<string, string>
                    {
                        Key = key,
                        Value = messageStr
                    });
            }
            catch (ProduceException<string, string> ex)
            {
                Console.WriteLine($"Failed to deliver message: {ex.Error.Reason}");
                throw;
            }
        });
    }

    public void Dispose()
    {
        _producer?.Dispose();
    }
}