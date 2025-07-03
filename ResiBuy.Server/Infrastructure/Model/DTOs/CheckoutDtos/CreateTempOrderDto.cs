namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class CreateTempOrderDto
    {
        public bool IsInstance { get; set; }
        public List<CreateTempCartItemDto> CartItems { get; set; }
    }
}
