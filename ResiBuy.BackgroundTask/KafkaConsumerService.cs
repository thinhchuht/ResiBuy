using Confluent.Kafka;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace ResiBuy.BackgroundTask;

public class KafkaConsumerService : IKafkaConsumerService, IDisposable
{
    private readonly IConsumer<string, string> _consumer;
    private readonly ILogger<KafkaConsumerService> _logger;
    private readonly KafkaSettings _kafkaSettings;
    private bool _disposed = false;

    public KafkaConsumerService(IOptions<KafkaSettings> kafkaSettings, ILogger<KafkaConsumerService> logger)
    {
        _kafkaSettings = kafkaSettings.Value;
        _logger = logger;

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

                    await ProcessMessageAsync(consumeResult);
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

    private async Task ProcessMessageAsync(ConsumeResult<string, string> consumeResult)
    {
        try
        {
            _logger.LogInformation("Received message from topic {Topic}, partition {Partition}, offset {Offset}",
                consumeResult.Topic, consumeResult.Partition, consumeResult.Offset);

            _logger.LogInformation("Message Key: {Key}", consumeResult.Message.Key);
            _logger.LogInformation("Message Value: {Value}", consumeResult.Message.Value);

            // Process different topics
            switch (consumeResult.Topic)
            {
                case "checkout-topic":
                    await ProcessCheckoutMessageAsync(consumeResult.Message.Value);
                    break;
                case "resi-topic":
                    await ProcessResiMessageAsync(consumeResult.Message.Value);
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

    private async Task ProcessCheckoutMessageAsync(string message)
    {
        try
        {
            _logger.LogInformation("Processing checkout message: {Message}", message);

            // Parse the checkout message with typed model
            var checkoutData = JsonSerializer.Deserialize<CheckoutMessage>(message);

            if (checkoutData != null)
            {
                _logger.LogInformation("Processing checkout for user {UserId}, order {OrderId}, total: {TotalAmount}",
                    checkoutData.UserId, checkoutData.OrderId, checkoutData.TotalAmount);

                // Add your checkout processing logic here
                // For example:
                // - Update order status in database
                // - Send email notifications
                // - Update inventory
                // - Send notifications via SignalR

                await Task.Delay(100); // Simulate processing time
                _logger.LogInformation("Checkout message processed successfully for order {OrderId}", checkoutData.OrderId);
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

    private async Task ProcessResiMessageAsync(string message)
    {
        try
        {
            _logger.LogInformation("Processing resi message: {Message}", message);

            // Parse the resi message with typed model
            var resiData = JsonSerializer.Deserialize<ResiMessage>(message);

            if (resiData != null)
            {
                _logger.LogInformation("Processing resi message - Type: {Type}, Action: {Action}",
                    resiData.Type, resiData.Action);

                // Add your resi processing logic here based on type and action
                switch (resiData.Type.ToLower())
                {
                    case "area":
                        await ProcessAreaMessageAsync(resiData);
                        break;
                    case "building":
                        await ProcessBuildingMessageAsync(resiData);
                        break;
                    case "room":
                        await ProcessRoomMessageAsync(resiData);
                        break;
                    default:
                        _logger.LogWarning("Unknown resi type: {Type}", resiData.Type);
                        break;
                }

                await Task.Delay(100); // Simulate processing time
                _logger.LogInformation("Resi message processed successfully for {Type} {Action}",
                    resiData.Type, resiData.Action);
            }
            else
            {
                _logger.LogWarning("Failed to deserialize resi message");
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing resi message");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing resi message");
        }
    }

    private async Task ProcessAreaMessageAsync(ResiMessage resiData)
    {
        _logger.LogInformation("Processing area message - Action: {Action}", resiData.Action);
        // Add area-specific processing logic
        await Task.CompletedTask;
    }

    private async Task ProcessBuildingMessageAsync(ResiMessage resiData)
    {
        _logger.LogInformation("Processing building message - Action: {Action}", resiData.Action);
        // Add building-specific processing logic
        await Task.CompletedTask;
    }

    private async Task ProcessRoomMessageAsync(ResiMessage resiData)
    {
        _logger.LogInformation("Processing room message - Action: {Action}", resiData.Action);
        // Add room-specific processing logic
        await Task.CompletedTask;
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