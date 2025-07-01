namespace ResiBuy.Server.Infrastructure.Model.DTOs.CheckoutDtos
{
    public class UpdateTempOrderDto
    {
        public Guid Id { get; set; }
        public Guid? VoucherId { get; set; }
        public string Note { get; set; }

    }
}
