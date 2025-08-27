namespace ResiBuy.BackgroundTask.Services.KafkaConsumeServices;

public class KafkaConsumerService : IKafkaConsumerService, IDisposable
{
    private readonly IConsumer<string, string> _consumer;
    private readonly ILogger<KafkaConsumerService> _logger;
    private readonly KafkaSettings _kafkaSettings;
    private readonly ICheckoutService _checkoutService;
    private bool _disposed = false;

    public KafkaConsumerService(IOptions<KafkaSettings> kafkaSettings, ILogger<KafkaConsumerService> logger, ICheckoutService checkoutService)
    {
        _kafkaSettings = kafkaSettings.Value;
        _logger = logger;
        _checkoutService = checkoutService;

        var config = new ConsumerConfig
        {
            BootstrapServers = _kafkaSettings.BootstrapServers,
            GroupId = _kafkaSettings.GroupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false,
            EnablePartitionEof = true
        };
        _consumer = new ConsumerBuilder<string, string>(config).Build();
    }

    public async Task StartConsumingAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting Kafka consumer for topics: {Topics}", string.Join(", ", _kafkaSettings.Topics));
            _consumer.Subscribe(_kafkaSettings.Topics);
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = _consumer.Consume(cancellationToken);

                    if (consumeResult.IsPartitionEOF)
                    {
                        _logger.LogDebug("Reached end of partition {Partition} for topic {Topic}",
                            consumeResult.Partition, consumeResult.Topic);
                        continue;
                    }

                    await ProcessMessageAsync(consumeResult, _checkoutService);
                    _consumer.Commit(consumeResult);
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(ex, "Error consuming message from Kafka");
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Kafka consumer operation cancelled");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error in Kafka consumer");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting Kafka consumer");
            throw;
        }
    }

    private async Task ProcessMessageAsync(ConsumeResult<string, string> consumeResult, ICheckoutService checkoutService)
    {
        try
        {
            _logger.LogInformation("Received message from topic {Topic}, partition {Partition}, offset {Offset}",
                consumeResult.Topic, consumeResult.Partition, consumeResult.Offset);
            switch (consumeResult.Topic)
            {
                case "checkout-topic":
                    await ProcessCheckoutMessageAsync(consumeResult.Message.Value, checkoutService);
                    break;
                case "process-topic":
                    await ProcessMessageAsync(consumeResult.Message.Value, checkoutService);
                    break;

                default:
                    _logger.LogWarning("Unknown topic: {Topic}", consumeResult.Topic);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message from topic {Topic}", consumeResult.Topic);
        }
    }

    private async Task ProcessCheckoutMessageAsync(string message, ICheckoutService checkoutService)
    {
        try
        {
            _logger.LogInformation("Processing checkout message: {Message}", message);

            var checkoutData = JsonSerializer.Deserialize<CheckoutData>(message);

            if (checkoutData != null)
            {
                _logger.LogInformation("Processing checkout for user");
                await checkoutService.Checkout(checkoutData);
                await Task.Delay(100);
            }
            else
            {
                _logger.LogWarning("Failed to deserialize checkout message");
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing checkout message");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing checkout message");
        }
    }
    private async Task ProcessMessageAsync(string message, IProcessService processService)
    {
        try
        {
            _logger.LogInformation("Processing process message: {Message}", message);

            var processData = JsonSerializer.Deserialize<UpdateOrderStatusDto>(message);

            if (processData != null)
            {
                _logger.LogInformation("Processing process for user");
                await processService.Process(processData);
                await Task.Delay(100);
            }
            else
            {
                _logger.LogWarning("Failed to deserialize process message");
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing process message");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing process message");
        }
    }

    public async Task StopConsumingAsync()
    {
        try
        {
            _logger.LogInformation("Stopping Kafka consumer");
            _consumer?.Close();
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping Kafka consumer");
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _consumer?.Dispose();
            _disposed = true;
        }
    }
}