namespace ResiBuy.Server.Application.Commands.OrderCommands.Dtos
{
    public class CreateOrderResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public Guid? OrderId { get; set; }
        public string? PaymentUrl { get; set; }

        public CreateOrderResponse(bool success, string message, Guid? orderId = null, string? paymentUrl = null)
        {
            Success = success;
            Message = message;
            OrderId = orderId;
            PaymentUrl = paymentUrl;
        }
    }
}
