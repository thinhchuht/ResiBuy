namespace ResiBuy.Server.Services.VNPayServices
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(decimal amount, Guid orderId, string orderInfo);
        bool ValidatePayment(string responseData);
        Task<string> StorePayFee(Guid storeId);
        Task<bool> ProcessStorePaymentCallback(string responseData);
    }
}