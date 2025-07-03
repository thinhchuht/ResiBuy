using ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos;

namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class CartItemDto
    {
        public string Id { get; set; }
        public string CartId { get; set; }
        public int Quantity { get; set; }
        public int ProductDetailId { get; set; }
        public TempProductDetailDto ProductDetail { get; set; }
    }
}
