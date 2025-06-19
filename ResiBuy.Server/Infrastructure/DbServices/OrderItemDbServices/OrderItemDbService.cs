namespace ResiBuy.Server.Infrastructure.DbServices.OrderItemDbServices
{
    public class OrderItemDbService : BaseDbService<OrderItem>, IOrderItemDbService
    {
        private readonly ResiBuyContext _context;
        public OrderItemDbService(ResiBuyContext context) : base(context)
        {
            this._context = context;
        }
    }
}
