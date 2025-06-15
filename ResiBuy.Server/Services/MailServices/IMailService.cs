namespace ResiBuy.Server.Services.MailServices
{
    public interface IMailBaseService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = false);
    }
}