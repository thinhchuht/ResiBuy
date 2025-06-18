namespace ResiBuy.Server.Services.OrderServices;

public class OrderService : IOrderService
{
    private readonly IUserDbService _userDbService;
    private readonly IRoomDbService _roomDbService;
    private readonly IBuildingDbService _buildingDbService;
    private readonly IAreaDbService _areaDbService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        IUserDbService userDbService,
        IRoomDbService roomDbService,
        IBuildingDbService buildingDbService,
        IAreaDbService areaDbService,
        ILogger<OrderService> logger)
    {
        _userDbService = userDbService;
        _roomDbService = roomDbService;
        _buildingDbService = buildingDbService;
        _areaDbService = areaDbService;
        _logger = logger;
    }

    public async Task<ResponseModel> CreateOrdersAsync(CheckoutRequestDto checkoutRequest)
    {
        try
        {

            // Validate user exists
            var user = await _userDbService.GetUserById(checkoutRequest.UserId);
            if (user == null)
            {
                return ResponseModel.FailureResponse("User not found");
            }

            var createdOrders = new List<Order>();

            foreach (var orderRequest in checkoutRequest.Orders)
            {
                var room = await _roomDbService.GetByIdBaseAsync(Guid.Parse(orderRequest.RoomId));
                if (room == null)
                {
                    return ResponseModel.FailureResponse($"Room not found: {orderRequest.RoomId}");
                }

                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    UserId = checkoutRequest.UserId,
                    ShippingAddressId = Guid.Parse(orderRequest.RoomId),
                    TotalPrice = orderRequest.TotalPrice,
                    PaymentMethod = orderRequest.PaymentMethod,
                    Note = orderRequest.Note,
                    Status = "Pending",
                    CreateAt = DateTime.UtcNow,
                    UpdateAt = DateTime.UtcNow
                };

                // Add voucher if provided
                if (!string.IsNullOrEmpty(orderRequest.VoucherId))
                {
                    order.VoucherId = Guid.Parse(orderRequest.VoucherId);
                }

                // Create order items
                var orderItems = orderRequest.Items.Select(item => new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductDetailId = item.ProductDetailId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                }).ToList();

                order.Items = orderItems;
                createdOrders.Add(order);
            }
                createdOrders.Count, checkoutRequest.UserId);

            return ResponseModel.SuccessResponse(new
            {
                orderCount = createdOrders.Count,
                totalAmount = checkoutRequest.TotalAmount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating orders for user {UserId}", checkoutRequest.UserId);
            return ResponseModel.FailureResponse("Error creating orders: " + ex.Message);
        }
    }
}