
namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class CheckShipperService : BackgroundService
    {
        private readonly ILogger<CheckShipperService> _logger;
        private readonly IServiceProvider _serviceProvider;
        public CheckShipperService(ILogger<CheckShipperService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextRunTime = DateTime.Today.AddDays(now.Hour >= 2 ? 1 : 0).AddHours(2);
                var delay = nextRunTime - now;

                _logger.LogInformation($"Service will run at {nextRunTime}. Waiting {delay.TotalMinutes} minutes.");

                await Task.Delay(delay, stoppingToken);

                try
                {
                    _logger.LogInformation($"Running task at: {DateTime.Now}");
                    await CheckOutShipper();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while running daily task.");
                }

            }
        }

        private async Task CheckOutShipper()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<ResiBuyContext>();
                var shippers = await _context.Shippers.Where(s => s.IsLocked == false).ToListAsync();
                foreach (var shipper in shippers)
                {
                    if (shipper.FirstTimeLogin == null)
                    {
                        _context.TimeSheets.Add(new TimeSheet(shipper.Id, DateTime.Now, false));
                    }
                    else
                    {
                        var loginTime = ConvertTimeToFloat(shipper.FirstTimeLogin.Value);
                        if (loginTime < shipper.StartWorkTime+0.25)
                        {
                            shipper.FirstTimeLogin = null;
                            _context.TimeSheets.Add(new TimeSheet(shipper.Id, (DateTime)shipper.FirstTimeLogin, true));
                        }
                    }
                }
                await _context.SaveChangesAsync();
                _logger.LogInformation("Task executed at: " + DateTime.Now);
            }

        }
        public static double ConvertTimeToFloat(DateTime dateTime)
        {
            return dateTime.Hour + dateTime.Minute / 60.0;
        }
    }
}
