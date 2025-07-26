using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

namespace ResiBuy.Server.Services.MyBackgroundService
{
    public class AssignOrderForShipper : BackgroundService
    {
        private readonly ILogger<AssignOrderForShipper> _logger;
        private readonly IServiceProvider _serviceProvider;

        public AssignOrderForShipper(ILogger<AssignOrderForShipper> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AssignOrderForShipper is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var orderDbService = scope.ServiceProvider.GetRequiredService<IOrderDbService>();
                    var shipperDbService = scope.ServiceProvider.GetRequiredService<IShipperDbService>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                    var areaDBService = scope.ServiceProvider.GetRequiredService<IAreaDbService>();

                    try
                    {
                        var orders = await orderDbService.getOrdersByStatus(OrderStatus.Processing);
                        if (orders.Any())
                        {
                            foreach (var orderGroup in orders.GroupBy(o => o.Store.Room.Building.AreaId))
                            {
                                var areaId = orderGroup.Key;
                                var ordersInArea = orderGroup.ToList();
                                var shippers = (await shipperDbService.GetShippersInAreaAsync(areaId)).Where(s => s.IsOnline == true)
                                               .OrderBy(s => s.LastDelivered ?? DateTimeOffset.MinValue)
                                               .ToList();

                                if (!shippers.Any())
                                {
                                    var nearestArea = await areaDBService.NearestAreaHasShipper(areaId);
                                    shippers.AddRange(nearestArea.Shippers);
                                };

                                int shipperIndex = 0;
                                foreach (var order in ordersInArea)
                                {
                                    var shipper = shippers[shipperIndex];

                                    await notificationService.SendNotificationAsync("ReceiveOrderNotification", new
                                    {
                                        OrderId = order.Id,
                                        TotalPrice = order.TotalPrice,
                                        Note = order.Note,
                                        StoreName = order.Store?.Name,
                                        AssignedTime = DateTimeOffset.Now
                                    }, Constants.ShipperHubGroup, [shipper.Id.ToString()]);

                                    _logger.LogInformation($"Gửi đơn hàng {order.Id} đến shipper {shipper.Id}");

                                    shipperIndex = (shipperIndex + 1) % shippers.Count;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred in background service.");
                    }
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("AssignOrderForShipper is stopping.");
        }
    }
}
