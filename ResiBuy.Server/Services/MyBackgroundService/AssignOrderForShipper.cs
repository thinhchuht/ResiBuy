namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class AssignOrderForShipper : BackgroundService
    {
        private readonly ILogger<AssignOrderForShipper> _logger;

        public AssignOrderForShipper(ILogger<AssignOrderForShipper> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MyBackgroundService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 📌 Thực hiện công việc định kỳ tại đây
                    _logger.LogInformation("MyBackgroundService is running at: {time}", DateTimeOffset.Now);

                    // TODO: Gọi service xử lý logic thực tế của bạn
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in background service.");
                }

                // ⏱️ Delay 5 phút
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("MyBackgroundService is stopping.");
        }

    }
}
