namespace ResiBuy.Server.Services.MailServices
{
    public interface IMailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = false);
    }
}