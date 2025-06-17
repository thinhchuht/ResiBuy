namespace ResiBuy.Server.Infrastructure.Model
{
    public class CartItem
    {
        public Guid                        Id              { get; set; }
        public int                         Quantity        { get; set; }
        public Guid                        CartId          { get; set; }
        public Guid                        ProductId       { get; set; }
        public Guid                        CostDataId      { get; set; }
        public Cart                        Cart            { get; set; }
        public Product                     Product         { get; set; }
        public CostData                    CostData        { get; set; }
        public ICollection<CartItemUncost> CartItemUncosts { get; set; } = new List<CartItemUncost>();
        public CartItem()
        {
            
        }
        public CartItem(int quantity, Guid cartId, Guid productId)
        {
            Quantity = quantity;
            CartId = cartId;
            ProductId = productId;
        }
        public void UpdateQuantity(int quantity)
        {
            Quantity = quantity;
        }
    }
  
}
