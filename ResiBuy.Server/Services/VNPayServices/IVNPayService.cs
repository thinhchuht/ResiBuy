namespace ResiBuy.Server.Services.VNPayServices
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(decimal amount, string orderId, string orderInfo);
        bool ValidatePayment(string responseData);
        Task<string> StorePayFee(Guid storeId);
        Task<bool> ProcessStorePaymentCallback(string responseData);
    Task<string> CustomerPay(Guid orderId, Guid? cartId = null);
    Task<bool> ProcessOrderPaymentCallback(string responseData, Guid orderId, Guid? cartId = null);
        Task<bool> RollbackOrderPaymentAsync(Guid orderId);
    }
}