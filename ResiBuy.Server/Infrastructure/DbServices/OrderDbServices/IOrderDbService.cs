namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public interface IOrderDbService : IBaseDbService<Order>
{
    Task<PagedResult<Order>> GetAllAsync(
        OrderStatus orderStatus,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        Guid storeId,
        Guid shipperId,
        string userId = null,
        int pageNumber = 1,
        int pageSize = 10,
        DateTime? startDate = null,
        DateTime? endDate = null
    );
    Task<Order> GetById(Guid id);
    Task<List<Order>> getOrdersByStatus(OrderStatus orderStatus);
    Task<List<Order>> GetCancelledOrders();
    Task<Order> UpdateOrderStatus(Guid orderId, OrderStatus orderStatus);
    Task<decimal> ShippingFeeCharged(Guid ShippingAddress, Guid storeAddress, float weight);
    Task<decimal> GetMonthlyBankRevenue(Guid storeId, int month);
    Task<int> CountOrdersByShipperIdAsync(Guid shipperId);
    Task<decimal> GetShippingFeeByShipperAsync(Guid shipperId, DateTime? startDate = null, DateTime? endDate = null);
    Task<int> CountOrdersAsync(Guid? shipperId, Guid? storeId, string? userId, OrderStatus? status );
    Task<decimal> GetTotalShippingFeeByshipperAsync(Guid shipperId, DateTime? startDate = null, DateTime? endDate = null);
    Task<decimal> GetTotalOrderAmountByUserAndStoreAsync(string? userId, Guid? storeId);

}