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
                <div style="background-color: #f0f0f0; padding: 10px; display: flex; justify-content: flex-start; text-align: center;">
                  <img src="{_logoUrl}" alt="Résibuy Logo" style="height: 100px;" />
                     <h1 style="margin-left: 20px; color: #333; font-size: 24px; display: flex; justify-content: center; align-items: center;">ResiBuy</h1>
              </div>

               <div style="padding: 20px; line-height: 1.6; color: #000;">
                  {content}
                </div>

              <div style="background-color: #444; color: #fff; padding: 15px; text-align: center; font-size: 13px;">
                  <p><strong>ResiBuy</strong></p>
                    <p>Số 01 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                    <p>📞 +1 234 567 890 &nbsp; ✉️ <a href="mailto:{_fromEmail}" style="color: #00aaff; text-decoration: none;">{_fromEmail}</a></p>
                </div>
            </div>
         </body>
         </html>Add commentMore actions
         """;
        }
}
}