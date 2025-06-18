namespace ResiBuy.Server.Services.KafkaServices;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public KafkaProducerService(IOptions<KafkaSetting> kafkaSetting)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = kafkaSetting.Value.BootstrapServers
        };

        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    public void ProduceMessageAsync(string key, string message, string topic)
    {
        _ = Task.Run(async () =>
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
                Console.WriteLine($"Kafka send failed: {ex.Error.Reason}");
                throw new CustomException(ExceptionErrorCode.RepositoryError, message, ex);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error while sending Kafka message: {ex.Message}");
                throw new CustomException(ExceptionErrorCode.RepositoryError, message, ex);
            }
        });
    }

    public void Dispose()
    {
        _producer?.Dispose();
    }
}