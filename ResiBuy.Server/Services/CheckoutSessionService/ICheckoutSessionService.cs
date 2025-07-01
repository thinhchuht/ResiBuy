using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;

namespace ResiBuy.Server.Services.CheckoutSessionService;

public interface ICheckoutSessionService
{
    void StoreCheckoutSession(Guid orderId, TempCheckoutDto checkoutDto);
    TempCheckoutDto GetCheckoutSession(string sessionId);
    void RemoveCheckoutSession(string sessionId);
    bool IsSessionValid(string sessionId);
    Task CleanupExpiredSessionsAsync();
}