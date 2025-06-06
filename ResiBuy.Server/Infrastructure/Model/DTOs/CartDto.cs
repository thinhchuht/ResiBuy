namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class CartDto
    {
        public Guid                  Id        { get; set; }
        public string                UserId    { get; set; }
        public IEnumerable<CartItem> CartItems { get; set; }
    }
}
