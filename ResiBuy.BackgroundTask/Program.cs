var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<KafkaSettings>(builder.Configuration.GetSection("Kafka"));
builder.Services.AddSingleton<IKafkaConsumerService, KafkaConsumerService>();
builder.Services.AddHttpClient<ICheckoutService, CheckoutService>(c => c.BaseAddress = new Uri("http://localhost:5000/api/"));
builder.Services.AddSingleton<ICartService, CartService>();
builder.Services.AddHostedService<ResetCartStatusBackgroundService>();
builder.Services.AddHostedService<KafkaConsumerBackgroundService>();
builder.Services.AddHostedService<DeactivateVoucherBackgroundService>();
builder.Services.AddSingleton<HttpClient>();
builder.Services.AddSingleton<IVoucherService, VoucherService>();

var host = builder.Build();
host.Run();
