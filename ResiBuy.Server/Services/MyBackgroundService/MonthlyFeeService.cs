

namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class MonthlyFeeService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CheckShipperService> _logger;
        private readonly string _tempBody = "<!DOCTYPE html>\r\n<html lang=\"vi\">\r\n<head>\r\n  <meta charset=\"UTF-8\" />\r\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n  <title>Thông báo thanh toán phí dịch vụ ResiBuy</title>\r\n  <style>\r\n    body {\r\n      font-family: Arial, sans-serif;\r\n      background-color: #f4f4f7;\r\n      color: #333333;\r\n      margin: 0;\r\n      padding: 0;\r\n    }\r\n    .container {\r\n      max-width: 600px;\r\n      background-color: #ffffff;\r\n      margin: 30px auto;\r\n      padding: 20px;\r\n      border-radius: 8px;\r\n      box-shadow: 0 2px 8px rgba(0,0,0,0.1);\r\n    }\r\n    h1 {\r\n      color: #0052cc;\r\n      font-size: 24px;\r\n      margin-bottom: 10px;\r\n    }\r\n    p {\r\n      font-size: 16px;\r\n      line-height: 1.5;\r\n    }\r\n    .amount {\r\n      font-weight: bold;\r\n      font-size: 18px;\r\n      color: #d9534f;\r\n      margin: 20px 0;\r\n    }\r\n    .qr-container {\r\n      text-align: center;\r\n      margin-top: 30px;\r\n    }\r\n    .qr-container img {\r\n      width: 180px;\r\n      height: 180px;\r\n    }\r\n    .footer {\r\n      font-size: 12px;\r\n      color: #999999;\r\n      margin-top: 40px;\r\n      text-align: center;\r\n    }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"container\">\r\n    <h1>Thông báo thanh toán phí dịch vụ ResiBuy</h1>\r\n    <p>Kính gửi Quý khách hàng,</p>\r\n    <p>Tháng này Quý khách cần thanh toán <span class=\"amount\">{{Amount}}</span> phí sử dụng dịch vụ ResiBuy.</p>\r\n    <p>Vui lòng sử dụng mã QR dưới đây để quét và thực hiện thanh toán nhanh chóng, thuận tiện.</p>\r\n\r\n    <div class=\"qr-container\">\r\n      <img src=\"{{QrCodeUrl}}\" alt=\"Mã QR thanh toán ResiBuy\" />\r\n      <p>Mã QR thanh toán dịch vụ ResiBuy</p>\r\n    </div>\r\n\r\n    <p>Xin cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi.</p>\r\n    <p>Trân trọng,<br />Đội ngũ ResiBuy</p>\r\n\r\n    <div class=\"footer\">\r\n      <p>Đây là email tự động, vui lòng không trả lời thư này.</p>\r\n    </div>\r\n  </div>\r\n</body>\r\n</html>\r\n";

        public MonthlyFeeService(IServiceProvider serviceProvider, ILogger<CheckShipperService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MonthlyJobService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;

                // Nếu bây giờ chưa đến 0h, đợi đến 0h
                var nextRunTime = now.Date.AddDays(1); // 0h ngày mai
                var delay = nextRunTime - now;

                _logger.LogInformation("Waiting {delay} until next check at {nextRunTime}", delay, nextRunTime);

                // Đợi đến 0h ngày tiếp theo
                await Task.Delay(delay, stoppingToken);

                // Lúc 0h chạy check ngày
                int day = DateTime.Now.Day;
                if (day >= 3 && day <= 7)
                {
                    _logger.LogInformation("Running monthly task on day 5");
                    await CheckPayFeeStatus();
                }
                if (day == 8)
                {
                    await ResetPayFeeStatus();
                }
            }

            _logger.LogInformation("MonthlyJobService stopped.");
        }

        private async Task CheckPayFeeStatus()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<ResiBuyContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IMailBaseService>();
                var stores = await _context.Stores.Include(s => s.Owner).Where(s => !s.IsLocked).ToListAsync();
                foreach (var store in stores)
                {
                    if (!store.IsPayFee)
                    {
                        await emailService.SendEmailAsync(store.Owner.Email, "Thông báo thanh toán chi phí dịch vụ ResiBuy", ProcessEmailBody(_tempBody, "200.000", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4e0smRFzB0kAztCtt-u8FrPMAeFjwoASmCg&s"), true);
                    }
                }
            }
        }

        private async Task ResetPayFeeStatus()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<ResiBuyContext>();
                try
                {
                    var stores = await _context.Stores.Where(s => !s.IsLocked).ToListAsync();
                    foreach (var store in stores)
                    {
                        if (store.IsPayFee)
                        {
                            store.IsPayFee = false;
                        }
                        else
                        {
                            store.IsLocked = true;
                        }
                    }
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Done reset pay fee status storeCount: {stores.Count}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in ResetPayFeeStatus");
                }
            }
        }

        public string ProcessEmailBody(string htmlTemplate, string amountText, string qrCodeUrl)
        {
            string result = htmlTemplate
                .Replace("{{Amount}}", amountText)
                .Replace("{{QrCodeUrl}}", qrCodeUrl);

            return result;
        }
    }
}
