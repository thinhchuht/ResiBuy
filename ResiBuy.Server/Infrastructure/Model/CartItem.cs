namespace ResiBuy.Server.Infrastructure.Model
{
    public class CartItem
    {
        public Guid    Id        { get; set; }
        public int     Quantity  { get; set; }
        public Guid    CartId    { get; set; }
        public Guid    ProductId { get; set; }
        public Cart    Cart      { get; set; }
        public Product Product   { get; set; }
    }
}
