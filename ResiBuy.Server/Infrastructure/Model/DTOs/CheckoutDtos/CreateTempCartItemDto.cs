namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class CreateTempCartItemDto
    {
        public Guid? Id { get; set; }
        public int ProductDetailId { get; set; }
        public Guid StoreId { get; set; }
        public int Quantity { get; set; }
        public Guid? CartId { get; set; }
    }
}
