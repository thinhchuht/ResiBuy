using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ResiBuy.Server.Services.MailServices
{
    public class MailBaseService : IMailBaseService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public MailBaseService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpServer = _configuration["MailSettings:SmtpServer"];
            _smtpPort = int.Parse(_configuration["MailSettings:SmtpPort"]);
            _smtpUsername = _configuration["MailSettings:SmtpUsername"];
            _smtpPassword = _configuration["MailSettings:SmtpPassword"];
            _fromEmail = _configuration["MailSettings:FromEmail"];
            _fromName = _configuration["MailSettings:FromName"];
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            await Task.Run(async () =>
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
                        builder.HtmlBody = body;
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
                    throw new Exception($"Failed to send email: {ex.Message}", ex);
                }
            });
        }
    }
}
