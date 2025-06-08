namespace ResiBuy.Server.Infrastructure.DbServices.CartDbService
{
    public class CartDbService : BaseDbService<Cart>, ICartDbService
    {
        public CartDbService(ResiBuyContext context) : base(context)
        {
            // Ensure the context is passed to the base class constructor.  
        }
    }
}
