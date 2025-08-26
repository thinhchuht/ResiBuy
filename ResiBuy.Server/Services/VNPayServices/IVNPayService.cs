namespace ResiBuy.Server.Services.VNPayServices
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(decimal amount, string orderId, string orderInfo);
        bool ValidatePayment(string responseData);
        Task<string> StorePayFee(Guid storeId);
        Task<bool> ProcessStorePaymentCallback(string responseData);
    }
}