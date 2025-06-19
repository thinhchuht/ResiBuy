using ResiBuy.BackgroundTask.Model;

namespace ResiBuy.BackgroundTask.Services.HttpService
{
    public interface ICheckoutService
    {
        Task<ResponseModel> Checkout(CheckoutData checkoutData);
    }
}