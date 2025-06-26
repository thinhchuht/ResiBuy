using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace ResiBuy.Server.Services.SMSServices
{
    public class SMSService(IConfiguration configuration, ILogger<SMSService> logger) : ISMSService
    {
        private readonly string _accountSid = configuration["Twilio:AccountSid"]!;
        private readonly string _authToken = configuration["Twilio:AuthToken"]!;
        private readonly string _fromPhone = configuration["Twilio:FromPhone"]!;

        public void SendSms(string toPhone, string message)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    TwilioClient.Init(_accountSid, _authToken);

                    var result = await MessageResource.CreateAsync(
                        body: message,
                        from: new PhoneNumber(_fromPhone),
                        to: new PhoneNumber(toPhone)
                    );

                    logger.LogInformation($"SMS sent. SID: {result.Sid}");
                }
                catch (Exception ex)
                {
                    logger.LogError($"Failed to send SMS: {ex.Message}");
                }
            });
        }
    }
}