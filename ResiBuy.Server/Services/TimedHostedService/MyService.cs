using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Services.TimedHostedService
{
    public class MyService : IMyService
    {
        private readonly IOrderDbService _orderDbService;
        private readonly IShipperDbService _shipperDbService;
        public MyService(IOrderDbService orderDbService)
        {
            _orderDbService = orderDbService;
        }
        public async void Run()
        {
            //var ordersStoreAccepted = await _orderDbService.getOrdersByStatus(OrderStatus.StoreAccepted);

        }
    }
}
