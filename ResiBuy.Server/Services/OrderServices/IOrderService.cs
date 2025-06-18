using ResiBuy.Server.Infrastructure.Model.DTOs;

namespace ResiBuy.Server.Services.OrderServices;

public interface IOrderService
{
    Task<ResponseModel> CreateOrdersAsync(CheckoutRequestDto checkoutRequest);
}