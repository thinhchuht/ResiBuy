using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record CreateAreaCommand(CommanAreaDto area) : IRequest<ResponseModel>;
    public class CreateAreaCommandHandler(IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<CreateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateAreaCommand command, CancellationToken cancellationToken)
        {

            if (string.IsNullOrEmpty(command.area.Name)) return ResponseModel.FailureResponse("Name is Required");
            if(command.area.Latitude<-90 || command.area.Latitude>90) return ResponseModel.FailureResponse("Latitude must be between -90 and 90");
            if(command.area.Longitude < -180 || command.area.Longitude > 180) return ResponseModel.FailureResponse("Longitude must be between -180 and 180");
            var area = new Area(command.area.Name, command.area.Latitude, command.area.Longitude);
            var createAreaResponse = await areaDbService.CreateAsync(area);
            //await kafkaProducerService.ProduceMessageAsync(configuration["Kafka:Topic"], area.Id.ToString(), JsonSerializer.Serialize(createAreaResponse.Data));
            return ResponseModel.SuccessResponse(createAreaResponse);
        }
    }
}
