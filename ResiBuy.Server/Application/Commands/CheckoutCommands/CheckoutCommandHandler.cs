namespace ResiBuy.Server.Application.Commands.CheckoutCommands
{
    public record CheckoutCommand(CheckoutDto CheckoutDto) : IRequest<ResponseModel>;
    public class CheckoutCommandHandler(IKafkaProducerService producer, ICartDbService cartDbService, IRoomDbService roomDbService) : IRequestHandler<CheckoutCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CheckoutCommand command, CancellationToken cancellationToken)
        {
            var message = JsonSerializer.Serialize(command.CheckoutDto);
            await producer.ProduceMessageAsync("checkout", message, "checkout-topic");
            return ResponseModel.SuccessResponse();
        }
    }
}
