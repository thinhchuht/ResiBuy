namespace ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;

public class OrderDbService : BaseDbService<Order>, IOrderDbService
{
    private readonly ResiBuyContext _context;
    public OrderDbService(ResiBuyContext context) : base(context)
    {
        this._context = context;
    }
}