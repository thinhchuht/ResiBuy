namespace ResiBuy.Server.Services.SMSServices
{
    public interface ISMSService
    {
        void SendSms(string toPhone, string message);
    }
}