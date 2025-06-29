namespace ResiBuy.Server.Services.MailServices
{
    public interface IMailBaseService
    {
        void SendEmailInAnotherThread(string to, string subject, string body, bool isHtml = true);
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    }
}