using ResiBuy.BackgroundTask;
using ResiBuy.BackgroundTask.Services.HttpService;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<KafkaSettings>(builder.Configuration.GetSection("Kafka"));
builder.Services.AddSingleton<IKafkaConsumerService, KafkaConsumerService>();
builder.Services.AddHttpClient<ICheckoutService, CheckoutService>(c => c.BaseAddress = new Uri("http://localhost:5000/api/"));
builder.Services.AddHostedService<Worker>();
builder.Services.AddSingleton<HttpClient>();
var host = builder.Build();
host.Run();
