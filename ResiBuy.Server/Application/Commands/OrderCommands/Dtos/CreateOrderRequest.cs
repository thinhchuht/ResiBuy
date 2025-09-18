namespace ResiBuy.Server.Application.Commands.OrderCommands.Dtos
{
    public class CreateOrderRequest
    {
        public Guid CartId { get; set; }
        public string UserId { get; set; }
        public Guid? VoucherId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal? CustomerPaid { get; set; }
        public Guid StoreId { get; set; }

    }
}
