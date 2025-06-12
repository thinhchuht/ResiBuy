namespace ResiBuy.Server.Services.VNPayServices
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(decimal amount, string orderId, string orderInfo);
        bool ValidatePayment(string responseData);
    }
}