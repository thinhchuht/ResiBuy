using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.Model.EventDataDto;

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
                        var now = ConvertTimeToFloat(DateTime.Now);
                        var orders = await orderDbService.getOrdersByStatus(OrderStatus.Processing);
                        if (orders.Any())
                        {
                            var validOrders = orders.Where(o => o?.Store?.Room?.Building?.AreaId != null).ToList();
                            Func<Shipper, bool> isAvailable = s =>s.IsOnline && !s.IsShipping &&
                                                                !s.IsLocked && s.StartWorkTime <= now && s.EndWorkTime >= now;

                            foreach (var orderGroup in validOrders.GroupBy(o => o.Store.Room.Building.AreaId))
                            {
                                var areaId = orderGroup.Key;
                                var ordersInArea = orderGroup.ToList();
                                var shippers = (await shipperDbService.GetShippersInAreaAsync(areaId))
                                    .Where(isAvailable)
                                    .OrderBy(s => s.LastDelivered ?? DateTimeOffset.MinValue)
                                    .ToList();

                                if (!shippers.Any())
                                {
                                    var nearestArea = await areaDBService.NearestAreaHasShipper(areaId);
                                    if (nearestArea?.Shippers.Where(isAvailable) != null && nearestArea.Shippers.Any())
                                    {
                                        shippers.AddRange(nearestArea.Shippers.Where(isAvailable));
                                    }
                                }

                                if (!shippers.Any())
                                {
                                    _logger.LogWarning($"Không có shipper nào trong hoặc gần khu vực {areaId}. Bỏ qua đơn hàng.");
                                    continue; // Bỏ qua nhóm đơn hàng này
                                }

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
                                    }, Constants.NoHubGroup, [shipper.Id.ToString()]);
                                    await notificationService.SendNotificationAsync($"{Constants.OrderStatusChanged}-{OrderStatus.Assigned}", new OrderStatusChangedDto(order.Id, order.StoreId, order.Store.Name, order.Status, OrderStatus.Processing, order.PaymentStatus, order.CreateAt, order.UpdateAt), "", [order.UserId, order.Store.OwnerId]);
                                    order.ShipperId = shipper.Id;
                                    order.Status = OrderStatus.Assigned;
                                    order.UpdateAt = DateTime.Now;
                                    await orderDbService.UpdateAsync(order);
                                    _logger.LogInformation($"Gửi đơn hàng {order.Id} đến shipper {shipper.Id}");
                                    shipper.IsShipping = true;
                                    await shipperDbService.UpdateAsync(shipper);
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

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }

            _logger.LogInformation("AssignOrderForShipper is stopping.");
        }
        public static double ConvertTimeToFloat(DateTime dateTime)
        {
            return dateTime.Hour + dateTime.Minute / 60.0;
        }
    }
}
