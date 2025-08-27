using ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos;
using ResiBuy.Server.Infrastructure.Model.DTOs.StatisticAdminDtos;
using ResiBuy.Server.Services.MapBoxService;
using ResiBuy.Server.Services.OpenRouteService;

namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public class OrderDbService : BaseDbService<Order>, IOrderDbService
{
    private readonly ResiBuyContext _context;
    private readonly MapBoxService _mapBoxService;
    private readonly OpenRouteService _openRouteService;
    public OrderDbService(ResiBuyContext context, MapBoxService mapBoxService, OpenRouteService openRouteService) : base(context)
    {
        this._context = context;
        this._mapBoxService = mapBoxService;
        this._openRouteService = openRouteService;
    }
    public async Task<PagedResult<Order>> GetAllAsync(
        string keyword,
        OrderStatus orderStatus,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        Guid storeId,
        Guid shipperId,
        string userId = null,
        int pageNumber = 1,
        int pageSize = 10,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        if (pageNumber < 1 || pageSize < 1)
            throw new ArgumentException("Số trang và số lượng phải lớn hơn 0");

        try
        {
            var query = _context.Orders.AsQueryable();
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(o => o.UserId == userId);

            if (storeId != Guid.Empty)
                query = query.Where(o => o.StoreId == storeId);

            if (shipperId != Guid.Empty)
                query = query.Where(o => o.ShipperId == shipperId);

            if (orderStatus != OrderStatus.None)
                query = query.Where(o => o.Status == orderStatus);

            if (paymentMethod != PaymentMethod.None)
                query = query.Where(o => o.PaymentMethod == paymentMethod);

            if (paymentStatus != PaymentStatus.None)
                query = query.Where(o => o.PaymentStatus == paymentStatus);

            if (startDate.HasValue)
                query = query.Where(o => o.UpdateAt >= startDate.Value);

            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.UpdateAt < end);
            }

            query = query
                .Include(o => o.ShippingAddress)
                    .ThenInclude(sa => sa.Building)
                        .ThenInclude(b => b.Area)
                .Include(o => o.Store)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductDetail)
                        .ThenInclude(pd => pd.Image)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductDetail)
                        .ThenInclude(pd => pd.Reviews)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductDetail)
                        .ThenInclude(pd => pd.Product)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductDetail)
                        .ThenInclude(pd => pd.AdditionalData)
                .Include(o => o.Voucher)
                .Include(o => o.Shipper)
                    .ThenInclude(s => s.User)
                .Include(o => o.User)
                .Include(o => o.Report);

            if (!string.IsNullOrEmpty(keyword))
            {
                var kw = keyword.Trim();
                query = query.Where(o =>
                    o.Id.ToString().Contains(kw) ||
                    (o.Shipper != null && o.Shipper.User.FullName.Contains(kw)) ||
                    (o.Shipper != null && o.Shipper.User.PhoneNumber.Contains(kw)) ||
                    (o.User != null && o.User.FullName.Contains(kw)) ||
                    (o.User != null && o.User.PhoneNumber.Contains(kw)) ||
                    (o.Store != null && o.Store.Name.Contains(kw)) ||
                    (o.Store != null && o.Store.PhoneNumber.Contains(kw))
                );
            }
            query = query
                .OrderBy(o => o.Status == OrderStatus.Reported && o.Report != null && !o.Report.IsResolved ? 0 : 1)
                .ThenByDescending(o => o.UpdateAt);
            var totalCount = await query.CountAsync();
            var orders = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return new PagedResult<Order>(orders, totalCount, pageNumber, pageSize);
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }


    public async Task<Order> GetById(Guid id)
    {
        return await _context.Orders.Include(o => o.ShippingAddress).ThenInclude(sa => sa.Building).ThenInclude(b => b.Area)
                .Include(o => o.Store)
                .Include(o => o.User)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Image)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.AdditionalData)
                .Include(o => o.Voucher)
                .Include(o => o.Shipper).ThenInclude(s => s.User)

                .Include(o => o.Report).FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Order>> GetCancelledOrders()
    {
        return await _context.Orders.Include(o => o.Report).Where(o => (o.Status == OrderStatus.Cancelled || (o.Status == OrderStatus.Reported && o.Report.IsResolved)) && o.PaymentMethod == PaymentMethod.BankTransfer && o.PaymentStatus == PaymentStatus.Paid).ToListAsync();
    }

    public async Task<decimal> GetMonthlyBankRevenue(Guid storeId, int month)
    {
        var now = DateTime.Now;
        int year = now.Month == month ? now.Year : (now.Month < month ? now.Year - 1 : now.Year);
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);
        return await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.PaymentMethod == PaymentMethod.BankTransfer
                && o.PaymentStatus == PaymentStatus.Paid
                && o.StoreId == storeId
                && o.UpdateAt >= startDate
                && o.UpdateAt < endDate)
            .SumAsync(o => (o.TotalPrice - o.ShippingFee.Value) * 90 / 100);
    }

    public async Task<List<Order>> getOrdersByStatus(OrderStatus orderStatus)
    {
        try
        {
            return await _context.Orders.Where(o => o.Status == orderStatus)
                .Include(o => o.Store).ThenInclude(s => s.Room)
                .ThenInclude(r => r.Building).ThenInclude(b => b.Area)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }
    public async Task<decimal> ShippingFeeCharged(Guid ShippingAddress, Guid storeAddress, float weight)
    {
        try
        {
            var shippingRoom = await _context.Rooms
                .Include(r => r.Building).ThenInclude(b => b.Area)
                .FirstOrDefaultAsync(r => r.Id == ShippingAddress);
            if (shippingRoom == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Địa chỉ giao hàng không tồn tại");
            }
            var storeRoom = await _context.Rooms
                .Include(r => r.Building).ThenInclude(b => b.Area)
                .FirstOrDefaultAsync(r => r.Id == storeAddress);
            if (storeRoom == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Địa chỉ cửa hàng không tồn tại");
            }
            decimal distanceFee = 5000;
            if (shippingRoom.Building.AreaId != storeRoom.Building.AreaId)
            {
                var route = await _openRouteService.GetRouteAsync(
                        shippingRoom.Building.Area.Latitude,
                        shippingRoom.Building.Area.Longitude,
                        storeRoom.Building.Area.Latitude,
                        storeRoom.Building.Area.Longitude
                        );
                if (route == null || route.Routes == null || route.Routes.Count == 0)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tính toán khoảng cách giao hàng");
                }
                var distance = route.Routes[0].Summary.Distance; // distance in meters
                if (distance > 200)
                {
                    distanceFee = (decimal)(Math.Round(distance / 500) * 5000); // 5000đ/500m
                }
            }
            decimal weightFee = 0;

            if (weight > 2)
            {
                weightFee = (decimal)(Math.Round((weight - 2) / 2) * 1000); // 1000đ/2kg
            }
            return distanceFee + weightFee;
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }

    public Task<Order> UpdateOrderStatus(Guid orderId, OrderStatus orderStatus)
    {
        try
        {
            var order = _context.Orders.FirstOrDefault(o => o.Id == orderId);
            if (order == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Đơn hàng không tồn tại");
            }
            if (orderStatus == OrderStatus.Delivered)
            {
                if (order.ShipperId == null)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng chưa được giao cho người giao hàng");
                }
                var shipper = _context.Shippers.FirstOrDefault(s => s.Id == order.ShipperId);
                if (shipper == null)
                {
                    throw new CustomException(ExceptionErrorCode.NotFound, "Người giao hàng không tồn tại");
                }
                shipper.LastDelivered = DateTime.UtcNow;
                try
                {
                    _context.Shippers.Update(shipper);
                    _context.SaveChanges();
                }
                catch
                {
                    throw new CustomException(ExceptionErrorCode.RepositoryError, "Cập nhật vị trí người giao hàng thất bại");
                }
            }
            order.Status = orderStatus;
            _context.Orders.Update(order);
            _context.SaveChanges();
            return Task.FromResult(order);
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }
    public async Task<int> CountOrdersByShipperIdAsync(Guid shipperId)
    {
        try
        {
            return await _context.Orders.CountAsync(o => o.ShipperId == shipperId && o.Status == OrderStatus.Delivered);
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
        }
    }
    public async Task<decimal> GetShippingFeeByShipperAsync(Guid shipperId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            if (shipperId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "ShipperId không hợp lệ");

            var query = _context.Orders
                .Where(o => o.ShipperId == shipperId && o.Status == OrderStatus.Delivered);

            if (startDate.HasValue)
                query = query.Where(o => o.UpdateAt >= startDate.Value);

            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.UpdateAt < end);
            }

            return await query.SumAsync(o => o.ShippingFee ?? 0);
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }
    public async Task<int> CountOrdersAsync(Guid? shipperId, Guid? storeId, string? userId, OrderStatus? status = null)
    {
        try
        {
            var query = _context.Orders.AsQueryable();

            if (shipperId.HasValue && shipperId != Guid.Empty)
                query = query.Where(o => o.ShipperId == shipperId.Value);

            if (storeId.HasValue && storeId != Guid.Empty)
                query = query.Where(o => o.StoreId == storeId.Value);

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(o => o.UserId == userId);

            if (status.HasValue && status.Value != OrderStatus.None)
                query = query.Where(o => o.Status == status.Value);

            return await query.CountAsync();
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }

    public async Task<decimal> GetTotalShippingFeeByshipperAsync(Guid shipperId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            if (shipperId == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "ShipperId không hợp lệ");

            var query = _context.Orders
                .Where(o => o.ShipperId == shipperId && o.Status == OrderStatus.Delivered);

            if (startDate.HasValue)
                query = query.Where(o => o.UpdateAt >= startDate.Value);

            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.UpdateAt < end);
            }

            return await query.SumAsync(o => o.ShippingFee ?? 0);
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }
    public async Task<decimal> GetTotalOrderAmountByUserAndStoreAsync(string? userId, Guid? storeId)
    {
        try
        {
            var query = _context.Orders.AsQueryable();
            if (!string.IsNullOrWhiteSpace(userId))
            {
                query = query.Where(o => o.UserId == userId);
            }
            if (storeId.HasValue && storeId.Value != Guid.Empty)
            {
                query = query.Where(o => o.StoreId == storeId.Value);
            }
            query = query.Where(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Reported);

            var total = await query.SumAsync(o => o.TotalPrice);
            return total;
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }
    public async Task<StatisticResponse> GetOrderStatisticsAsync(DateTime startTime, DateTime endTime)
    {
        var firstOrderDate = await _context.Orders.Where(o => o.Status == OrderStatus.Delivered 
        //|| o.Status == OrderStatus.Reported
        )
            .OrderBy(o => o.CreateAt)
            .Select(o => o.CreateAt.Date)
            .FirstOrDefaultAsync();

        if (firstOrderDate == default)
            throw new CustomException(ExceptionErrorCode.NotFound, "Không có đơn hàng nào.");
        if (startTime < firstOrderDate)
            startTime = firstOrderDate;
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => (o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Reported) &&
                        o.CreateAt.Date >= startTime.Date &&
                        o.CreateAt.Date <= endTime.Date)
            .ToListAsync();
        var dailyStats = orders
            .GroupBy(o => o.CreateAt.Date)
            .Select(g => new DailyOrderStatisticDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                TotalOrderAmount = g.Sum(x => x.TotalPrice),
                OrderCount = g.Count(),
                ProductQuantity = g.Sum(x => x.Items.Sum(i => i.Quantity)),
                UniqueBuyers = g.Select(x => x.UserId).Distinct().Count()
            })
            .OrderBy(d => d.Date)
            .ToList();
        var daysRange = (endTime.Date - startTime.Date).Days + 1;
        var prevStart = startTime.AddDays(-daysRange);
        var prevEnd = startTime.AddDays(-1);

        var prevOrders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => (o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Reported) && o.CreateAt.Date >= prevStart.Date && o.CreateAt.Date <= prevEnd.Date)
            .ToListAsync();
        var currentTotals = new
        {
            Amount = dailyStats.Sum(d => d.TotalOrderAmount),
            Count = dailyStats.Sum(d => d.OrderCount),
            Quantity = dailyStats.Sum(d => d.ProductQuantity),
            Buyers = dailyStats.Sum(d => d.UniqueBuyers)
        };
        var prevTotals = new
        {
            Amount = prevOrders.Sum(o => o.TotalPrice),
            Count = prevOrders.Count,
            Quantity = prevOrders.Sum(o => o.Items.Sum(i => i.Quantity)),
            Buyers = prevOrders.Select(o => o.UserId).Distinct().Count()
        };
        string Diff(decimal current, decimal previous)
        {
            if (previous == 0) // Tránh chia cho 0
                return current == 0 ? "0%" : "+100%";

            var percentChange = ((current - previous) / previous) * 100;
            return percentChange == 0
                ? "0%" : (percentChange > 0 ? $"+{percentChange:F2}%" : $"{percentChange:F2}%");
        }

        return new StatisticResponse
        {
            ActualStartDate = startTime,
            EndDate = endTime,
            Data = dailyStats,
            Comparison = new ComparisonDto
            {
                ChangeOrderAmount = Diff(currentTotals.Amount, prevTotals.Amount),
                ChangeOrderCount = Diff(currentTotals.Count, prevTotals.Count),
                ChangeProductQuantity = Diff(currentTotals.Quantity, prevTotals.Quantity),
                ChangeUniqueBuyers = Diff(currentTotals.Buyers, prevTotals.Buyers)
            }
        };
    }

    public async Task<TopStatisticsResponse> GetTopStatisticsAsync(DateTime startDate, DateTime endDate)
    {
        try
        {
            var firstOrderDate = await _context.Orders
                .Where(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Reported)
                .OrderBy(o => o.CreateAt)
                .Select(o => o.CreateAt)
                .FirstOrDefaultAsync();

            if (firstOrderDate == default)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không có đơn hàng nào.");

            var startTime = startDate;
            if (startTime < firstOrderDate)
                startTime = firstOrderDate;

            var ordersQuery = _context.Orders
                .Where(o => (o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Reported)
                    && o.CreateAt >= startTime && o.CreateAt < endDate.AddDays(1));
            var topBuyersQuery = ordersQuery
                .GroupBy(o => o.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalOrders = g.Count(),
                    TotalValue = g.Sum(o => o.TotalPrice)
                })
                .OrderByDescending(g => g.TotalOrders)
                .Take(20);

            var topBuyers = await topBuyersQuery.ToListAsync();

            var userIds = topBuyers.Select(b => b.UserId).ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                 .Include(u => u.Avatar)
                .Include(u => u.UserRooms)
                    .ThenInclude(ur => ur.Room)
                        .ThenInclude(r => r.Building)
                            .ThenInclude(b => b.Area)
                .ToDictionaryAsync(u => u.Id);

            var topBuyerDtos = topBuyers.Select(b =>
            {
                if (!users.TryGetValue(b.UserId, out var user))
                    return null;

                var room = user.UserRooms.FirstOrDefault()?.Room;
                var address = room != null ? $"{room.Name}-{room.Building.Name}-{room.Building.Area.Name}" : "N/A";

                return new TopBuyerDto
                {
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    Address = address,
                    Avatar = user.Avatar?.ThumbUrl,
                    TotalOrders = b.TotalOrders,
                    TotalValue = b.TotalValue
                };
            }).Where(dto => dto != null).ToList();

            var topProductsQuery = ordersQuery
                .SelectMany(o => o.Items, (o, oi) => new { o, oi })
                .GroupBy(x => new
                {
                    ProductId = x.oi.ProductDetail.Product.Id,
                    ProductName = x.oi.ProductDetail.Product.Name,
                    StoreName = x.o.Store.Name,
                    ProductImg = x.oi.ProductDetail.Image.ThumbUrl

                })
                .Select(g => new
                {
                    g.Key.ProductImg,
                    g.Key.ProductId,
                    g.Key.ProductName,
                    g.Key.StoreName,
                    SoldQuantity = g.Sum(x => x.oi.Quantity),
                    TotalRevenue = g.Sum(x => x.oi.Quantity * x.oi.Price)
                })
                .OrderByDescending(g => g.SoldQuantity)
                .Take(20);

            var topProducts = await topProductsQuery.ToListAsync();

            var topProductDtos = topProducts.Select(p => new TopProductDto
            {
                Id = p.ProductId,
                Name = p.ProductName,
                ProductImg = p.ProductImg,
                StoreName = p.StoreName,
                SoldQuantity = p.SoldQuantity,
                TotalRevenue = p.TotalRevenue
            }).ToList();


            var topStoresQuery = ordersQuery
                .GroupBy(o => o.StoreId)
                .Select(g => new
                {
                    StoreId = g.Key,
                    TotalOrders = g.Count(),
                    TotalRevenue = g.Sum(o => o.TotalPrice)
                })
                .OrderByDescending(g => g.TotalOrders)
                .Take(20);

            var topStores = await topStoresQuery.ToListAsync();

            var storeIds = topStores.Select(s => s.StoreId).ToList();

            var stores = await _context.Stores
                .Where(s => storeIds.Contains(s.Id))
                .Include(s => s.Room)
                    .ThenInclude(r => r.Building)
                        .ThenInclude(b => b.Area)
                .ToDictionaryAsync(s => s.Id);

            var topStoreDtos = topStores.Select(s =>
            {
                if (!stores.TryGetValue(s.StoreId, out var store))
                    return null;

                var address = $"{store.Room.Name}-{store.Room.Building.Name}-{store.Room.Building.Area.Name}";

                return new TopStoreDto
                {
                    StoreName = store.Name,
                    PhoneNumber = store.PhoneNumber,
                    Address = address,
                    TotalOrders = s.TotalOrders,
                    TotalRevenue = s.TotalRevenue
                };
            }).Where(dto => dto != null).ToList();

            return new TopStatisticsResponse
            {
                ActualStartDate = startTime,
                EndDate = endDate,
                TopBuyers = topBuyerDtos,
                TopProducts = topProductDtos,
                TopStores = topStoreDtos
            };
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }

    public async Task<OrderOverviewStats> GetOverviewStats(DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _context.Orders.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(o => o.UpdateAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.UpdateAt < end);
            }

            var stats = new OrderOverviewStats
            {
                Total = await query.CountAsync(),
                Pending = await query.CountAsync(o => o.Status == OrderStatus.Pending),
                Processing = await query.CountAsync(o => o.Status == OrderStatus.Processing),
                Shipped = await query.CountAsync(o => o.Status == OrderStatus.Shipped),
                Delivered = await query.CountAsync(o => o.Status == OrderStatus.Delivered),
                Cancelled = await query.CountAsync(o => o.Status == OrderStatus.Cancelled),
                Reported = await query.CountAsync(o => o.Status == OrderStatus.Reported)
            };

            return stats;
        }
        catch (Exception ex)
        {
            throw new CustomException(ExceptionErrorCode.RepositoryError, ex.ToString());
        }
    }

}