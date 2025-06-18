using ResiBuy.BackgroundTask;

var builder = Host.CreateApplicationBuilder(args);

// Configure Kafka settings
builder.Services.Configure<KafkaSettings>(builder.Configuration.GetSection("Kafka"));

// Register Kafka consumer service
builder.Services.AddSingleton<IKafkaConsumerService, KafkaConsumerService>();

// Register the background service
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
