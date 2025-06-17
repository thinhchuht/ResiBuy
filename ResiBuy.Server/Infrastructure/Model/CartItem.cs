namespace ResiBuy.Server.Infrastructure.Model
{
    public class CartItem
    {
        public Guid    Id        { get; set; }
        public int     Quantity  { get; set; }
        public Guid    CartId    { get; set; }
        public int    ProductDetailId { get; set; }
        public Cart    Cart      { get; set; }
        public ProductDetail ProductDetail { get; set; }
        public CartItem()
        {
            
        }
        public CartItem(int quantity, Guid cartId, int productDetailId)
        {
            Quantity = quantity;
            CartId = cartId;
            ProductDetailId = productDetailId;
        }
        public void UpdateQuantity(int quantity)
        {
            Quantity = quantity;
        }
    }
  
}
