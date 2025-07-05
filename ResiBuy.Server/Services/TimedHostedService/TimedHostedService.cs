namespace ResiBuy.Server.Services.TimedHostedService
{
    public class TimedHostedService : IHostedService, IDisposable
    {
        private Timer _timer;
        private readonly ILogger<TimedHostedService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public TimedHostedService(ILogger<TimedHostedService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Timed Hosted Service is starting.");

            // Chạy ngay lần đầu sau 0s, sau đó mỗi 5 phút (TimeSpan.FromMinutes(5))
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(5));

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            _logger.LogInformation("Scheduled task running at: {time}", DateTimeOffset.Now);

            using (var scope = _serviceProvider.CreateScope())
            {
                var myService = scope.ServiceProvider.GetRequiredService<IMyService>();
                myService.Run(); // Gọi hàm bạn muốn chạy mỗi 5 phút
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Timed Hosted Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
