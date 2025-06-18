namespace ResiBuy.Server.Infrastructure.Model.DTOs.CartDtos
{
    public class AddToCartDto
    {
        public int Quantity { get; set; }
        public int ProductDetailId { get; set; }
        public int AdditionalData { get; set; } 
        public bool IsAdd { get; set; }
    }
}
