namespace ResiBuy.Server.Services.MailServices
{
    public class MailBaseService(IConfiguration configuration) : IMailBaseService
    {
        private readonly string _smtpServer = configuration["MailSettings:SmtpServer"];
        private readonly int _smtpPort = int.Parse(configuration["MailSettings:SmtpPort"]);
        private readonly string _smtpUsername = configuration["MailSettings:SmtpUsername"];
        private readonly string _smtpPassword = configuration["MailSettings:SmtpPassword"];
        private readonly string _fromEmail = configuration["MailSettings:FromEmail"];
        private readonly string _fromName = configuration["MailSettings:FromName"];
        private readonly string _logoUrl = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1750142837/resibuy/Logo_bexwz0.png";

        public void SendEmailInAnotherThread(string to, string subject, string body, bool isHtml = true)
        {
            _ = Task.Run(() => SendEmailAsync(to, subject, body, isHtml));
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_fromName, _fromEmail));
                email.To.Add(MailboxAddress.Parse(to));
                email.Subject = subject;
                var builder = new BodyBuilder();
                if (isHtml)
                {
                    builder.HtmlBody = GenerateHTMLEmail(body);
                }
                else
                {
                    builder.TextBody = body;
                }

                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_smtpUsername, _smtpPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email Error] {ex.Message}");
            }
        }

        private string GenerateHTMLEmail(string content)
        {
            return $"""
         <!DOCTYPE html>
         <html lang="vi">
         <head>
           <meta charset="UTF-8">
         </head>
         <body style="font-family: Arial, sans-serif; font-size: 14px; margin: 20px 0 0 0; background-color: #fff;">
           <div style="width: 800px; margin: 0 auto; border: 1px solid #ccc;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; display: flex; align-items: center; justify-content: center; gap: 15px;">
                  <img src="{_logoUrl}" alt="ResiBuy Logo" style="height: 50px; width: auto; border-radius: 8px;" />
                  <div>
                    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">ResiBuy</h1>
                    <p style="margin: 3px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Nền tảng mua sắm trực tuyến</p>
                  </div>
                </div>

               <div style="padding: 20px; line-height: 1.6; color: #000;">
                  {content}
                </div>

                <!-- Footer -->
                <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center;">
                  <div style="margin-bottom: 15px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ecf0f1;">ResiBuy</h3>
                    <p style="margin: 0; font-size: 13px; color: #bdc3c7; font-style: italic;">Kết nối - Mua sắm - Tiện lợi</p>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 15px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #ecf0f1; line-height: 1.4;">📍 Số 01 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #ecf0f1;">📞 Hotline: <strong>+1 234 567 890</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #ecf0f1;">✉️ <a href="mailto:{_fromEmail}" style="color: #3498db; text-decoration: none; font-weight: 500;">{_fromEmail}</a></p>
                  </div>
                  
                  <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px;">
                    <p style="margin: 0; font-size: 11px; color: #95a5a6;">
                      © 2024 ResiBuy - Nền tảng mua sắm trực tuyến hàng đầu Việt Nam
                    </p>
                  </div>
                </div>
            </div>
         </body>
         </html>
         """;
        }
    }
}