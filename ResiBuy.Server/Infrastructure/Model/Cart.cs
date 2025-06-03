namespace ResiBuy.Server.Infrastructure.Model
{
    public class Cart
    {
        public Guid                  Id        { get; set; }
        public string                UserId    { get; set; }
        public User                  User      { get; set; }
        public IEnumerable<CartItem> CartItems { get; set; }
    }
}
