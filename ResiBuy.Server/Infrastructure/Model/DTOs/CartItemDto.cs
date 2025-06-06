namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class CartItemDto
    {
        public Guid Id        { get; set; }
        public int  Quantity  { get; set; }
        public Guid CartId    { get; set; }
        public Guid ProductId { get; set; }
    }
}
