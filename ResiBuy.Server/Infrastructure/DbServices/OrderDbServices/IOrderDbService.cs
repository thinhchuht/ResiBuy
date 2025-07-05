namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public interface IOrderDbService : IBaseDbService<Order>
{
    Task<PagedResult<Order>> GetAllAsync(
        OrderStatus orderStatus,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        Guid storeId,
        string userId = null,
        int pageNumber = 1,
        int pageSize = 10,
        DateTime? startDate = null,
        DateTime? endDate = null
    );
    Task<Order> GetById(Guid id);
    Task<List<Order>> getOrdersByStatus(OrderStatus orderStatus);
}