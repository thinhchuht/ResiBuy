namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record CreateAreaCommand(string Name) : IRequest<ResponseModel>;
    public class CreateAreaCommandHandler(IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<CreateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateAreaCommand command, CancellationToken cancellationToken)
        {

                if (string.IsNullOrEmpty(command.Name)) return ResponseModel.FailureResponse("Name is Required");
                var area = new Area(command.Name);
                var createAreaResponse = await areaDbService.CreateAsync(area);
                //await kafkaProducerService.ProduceMessageAsync(configuration["Kafka:Topic"], area.Id.ToString(), JsonSerializer.Serialize(createAreaResponse.Data));
                return ResponseModel.SuccessResponse(createAreaResponse);
        }
    }
}
