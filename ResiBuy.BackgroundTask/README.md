# ResiBuy Background Task - Kafka Consumer

This background service consumes messages from Kafka topics and processes them asynchronously.

## Configuration

### Kafka Settings

The service is configured via `appsettings.json`:

```json
{
  "Kafka": {
    "BootstrapServers": "localhost:9092",
    "GroupId": "resibuy-background-task-group",
    "Topics": ["checkout-topic", "resi-topic"]
  }
}
```

### Supported Topics

1. **checkout-topic**: Processes checkout messages

   - Message format: `CheckoutMessage`
   - Contains order information, user details, and items

2. **resi-topic**: Processes residential area messages
   - Message format: `ResiMessage`
   - Supports area, building, and room operations

## Message Formats

### CheckoutMessage

```json
{
  "userId": "user-id",
  "orderId": "order-id",
  "totalAmount": 100.5,
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 50.25
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### ResiMessage

```json
{
  "type": "area|building|room",
  "action": "create|update|delete",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Running the Service

1. Ensure Kafka is running on the configured bootstrap servers
2. Make sure the topics exist in Kafka
3. Run the background service:

```bash
cd ResiBuy.BackgroundTask
dotnet run
```

## Features

- **Automatic Offset Management**: Manually commits offsets after successful message processing
- **Error Handling**: Comprehensive error handling with logging
- **Graceful Shutdown**: Properly closes consumer connections on shutdown
- **Multiple Topic Support**: Can consume from multiple topics simultaneously
- **Type Safety**: Uses strongly-typed message models

## Logging

The service logs all activities including:

- Consumer startup/shutdown
- Message reception and processing
- Errors and exceptions
- Processing results

## Customization

To add new message types or processing logic:

1. Add new message models in `MessageModels.cs`
2. Update the `ProcessMessageAsync` method in `KafkaConsumerService.cs`
3. Add new topic to the configuration
4. Implement specific processing methods

## Dependencies

- `Confluent.Kafka`: Kafka client library
- `Microsoft.Extensions.Hosting`: Background service hosting
- `System.Text.Json`: JSON serialization
