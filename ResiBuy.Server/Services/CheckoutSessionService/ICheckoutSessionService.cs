namespace ResiBuy.Server.Services.CheckoutSessionService;

public interface ICheckoutSessionService
{
    void StoreCheckoutSession(Guid orderId, CheckoutDto checkoutDto);
    CheckoutDto GetCheckoutSession(string sessionId);
    void RemoveCheckoutSession(string sessionId);
    bool IsSessionValid(string sessionId);
    Task CleanupExpiredSessionsAsync();
}