namespace ResiBuy.Server.Infrastructure.Model
{
    public class CartItemUncost
    {
        public Guid CartItemId { get; set; }

        public Guid UncostDataId { get; set; }
        public CartItem CartItem { get; set; } = default!;

        public UncostData UncostData { get; set; } = default!;
    }
}
