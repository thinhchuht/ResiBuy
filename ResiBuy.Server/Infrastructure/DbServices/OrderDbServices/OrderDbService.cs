using ResiBuy.Server.Services.MapBoxService;

namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public class OrderDbService : BaseDbService<Order>, IOrderDbService
{
    private readonly ResiBuyContext _context;
    private readonly MapBoxService _mapBoxService;
    public OrderDbService(ResiBuyContext context, MapBoxService mapBoxService) : base(context)
    {
        this._context = context;
        this._mapBoxService = mapBoxService;
    }
    public async Task<PagedResult<Order>> GetAllAsync(OrderStatus orderStatus, PaymentMethod paymentMethod, PaymentStatus paymentStatus, Guid storeId, Guid shipperId, string userId = null, int pageNumber = 1, int pageSize = 10, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1)
                throw new ArgumentException("Số trang và số lượng phải lớn hơn 0");

            var query = _context.Orders.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(o => o.UserId == userId);
            }

            if (storeId != Guid.Empty)
            {
                query = query.Where(o => o.StoreId == storeId);
            }

            if (shipperId != Guid.Empty)
            {
                query = query.Where(o => o.ShipperId == shipperId);
            }



            if (orderStatus != OrderStatus.None)
            {
                query = query.Where(o => o.Status == orderStatus);
            }

            if (paymentMethod != PaymentMethod.None)
            {
                query = query.Where(o => o.PaymentMethod == paymentMethod);
            }

            if (paymentStatus != PaymentStatus.None)
            {
                query = query.Where(o => o.PaymentStatus == paymentStatus);
            }

            if (startDate.HasValue)
            {
                query = query.Where(o => o.UpdateAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(o => o.UpdateAt < end);
            }

            var totalCount = await query.CountAsync();
            var orders = await query
                .OrderBy(o => !(o.Status == OrderStatus.Reported && o.Report != null && !o.Report.IsResolved))
                .ThenByDescending(o => o.UpdateAt)
                .Include(o => o.ShippingAddress).ThenInclude(sa => sa.Building).ThenInclude(b => b.Area)
                .Include(o => o.Store)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Image)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.AdditionalData)
                .Include(o => o.Voucher)
                .Include(o => o.Shipper).ThenInclude(s => s.User)
                .Include(o => o.Report)
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
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Image)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.AdditionalData)
                .Include(o => o.Voucher)
                .Include(o => o.Shipper).ThenInclude(s => s.User)
                .Include(o => o.Report).FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Order>> GetCancelledOrders()
    {
        return await _context.Orders.Where(o => o.Status == OrderStatus.Cancelled && o.PaymentMethod == PaymentMethod.BankTransfer && o.PaymentStatus == PaymentStatus.Paid).ToListAsync();
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
            return await _context.Orders.Where(o => o.Status == orderStatus && o.PaymentMethod == PaymentMethod.BankTransfer)
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
                var route = await _mapBoxService.GetDirectionsAsync(
                        shippingRoom.Building.Area.Latitude,
                        shippingRoom.Building.Area.Longitude,
                        storeRoom.Building.Area.Latitude,
                        storeRoom.Building.Area.Longitude
                        );
                if (route == null || route.Routes == null || route.Routes.Count == 0)
                {
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tính toán khoảng cách giao hàng");
                }
                var distance = route.Routes[0].Distance; // distance in meters
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
    public async Task<Dictionary<string, decimal>> GetShippingFeeByShipperAsync(Guid shipperId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _context.Orders.AsQueryable();

            query = query.Where(o => o.ShipperId == shipperId && o.ShippingFee.HasValue);

            if (startDate.HasValue)
            {
                query = query.Where(o => o.CreateAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.CreateAt < endDate.Value.AddDays(1));
            }

            var now = DateTime.UtcNow;

            var allTime = await query.SumAsync(o => o.ShippingFee.Value);

            var today = await query.Where(o => o.CreateAt.Date == now.Date).SumAsync(o => o.ShippingFee.Value);

            var weekStart = now.Date.AddDays(-(int)now.DayOfWeek);
            var weekEnd = weekStart.AddDays(7);
            var thisWeek = await query.Where(o => o.CreateAt >= weekStart && o.CreateAt < weekEnd).SumAsync(o => o.ShippingFee.Value);

            var monthStart = new DateTime(now.Year, now.Month, 1);
            var monthEnd = monthStart.AddMonths(1);
            var thisMonth = await query.Where(o => o.CreateAt >= monthStart && o.CreateAt < monthEnd).SumAsync(o => o.ShippingFee.Value);

            var yearStart = new DateTime(now.Year, 1, 1);
            var yearEnd = yearStart.AddYears(1);
            var thisYear = await query.Where(o => o.CreateAt >= yearStart && o.CreateAt < yearEnd).SumAsync(o => o.ShippingFee.Value);

            // Shipping fee theo từng tháng trong năm hiện tại
            var monthly = await query
                .Where(o => o.CreateAt >= yearStart && o.CreateAt < yearEnd)
                .GroupBy(o => o.CreateAt.Month)
                .Select(g => new { Month = g.Key, Total = g.Sum(o => o.ShippingFee.Value) })
                .ToListAsync();

            var monthlyDict = monthly.ToDictionary(m => $"Month_{m.Month}", m => m.Total);

            var result = new Dictionary<string, decimal>
        {
            { "AllTime", allTime },
            { "Today", today },
            { "ThisWeek", thisWeek },
            { "ThisMonth", thisMonth },
            { "ThisYear", thisYear }
        };

            foreach (var m in monthlyDict)
            {
                result[m.Key] = m.Value;
            }

            return result;
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



}