using ResiBuy.Server.Services.OpenRouteService;

namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public class OrderDbService : BaseDbService<Order>, IOrderDbService
{
    private readonly ResiBuyContext _context;
    private readonly OpenRouteService _openRouteService;
    public OrderDbService(ResiBuyContext context, OpenRouteService openRouteService) : base(context)
    {
        this._context = context;
        this._openRouteService = openRouteService;
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
                .OrderByDescending(o => o.UpdateAt)
                .Include(o => o.ShippingAddress).ThenInclude(sa => sa.Building).ThenInclude(b => b.Area)
                .Include(o => o.Store)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Image)
                .Include(o => o.Items).ThenInclude(oi => oi.ProductDetail).ThenInclude(pd => pd.Product)
                .Include(o => o.Voucher)
                .Include(o => o.Shipper).ThenInclude(s => s.User)
                .Include(o => o.Reports)
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
                .Include(o => o.Voucher)
                .Include(o => o.Shipper).ThenInclude(s => s.User)
                .Include(o => o.Reports).FirstOrDefaultAsync(o => o.Id == id);
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

    public async Task<decimal> ShippingFeeCharged(Guid orderId)
    {
        try
        {
            var order = _context.Orders
                        .Include(o => o.ShippingAddress)
                            .ThenInclude(sa => sa.Building)
                                .ThenInclude(b => b.Area)
                        .Include(o => o.Store)
                            .ThenInclude(s => s.Room)
                                .ThenInclude(r => r.Building)
                                    .ThenInclude(b => b.Area)
                        .Include(o => o.Items)
                            .ThenInclude(oi => oi.ProductDetail)
                        .FirstOrDefault(o => o.Id == orderId);
            if (order == null)
            {
                throw new CustomException(ExceptionErrorCode.NotFound, "Đơn hàng không tồn tại");
            }
            if (order.ShippingAddress == null || order.ShippingAddress.Building == null || order.ShippingAddress.Building.Area == null)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Địa chỉ giao hàng không hợp lệ");
            }
            var route = await _openRouteService.GetRouteAsync(
                order.ShippingAddress.Building.Area.Latitude,
                order.ShippingAddress.Building.Area.Longitude,
                order.Store.Room.Building.Area.Latitude,
                order.Store.Room.Building.Area.Longitude
            );
            if (route == null || route.Routes == null || route.Routes.Count == 0)
            {
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không thể tính toán khoảng cách giao hàng");
            }
            var distance = route.Routes[0].Summary.Distance; // distance in meters
            decimal distanceFee = 0;
            if (distance > 200)
            {
                distanceFee = (decimal)(Math.Round(distance / 500) * 5000); // 5000đ/500m
            }
            float weight = 0;
            decimal weightFee = 0;
            foreach ( OrderItem item in order.Items)
            {
                weight += item.ProductDetail.Weight * item.Quantity;
            }
            if (weight > 2)
            {
                weightFee = (decimal)(Math.Round((weight-2) / 2) * 1000); // 1000đ/2kg
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
}