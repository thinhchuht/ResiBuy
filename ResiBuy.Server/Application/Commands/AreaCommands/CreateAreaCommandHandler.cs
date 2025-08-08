using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record CreateAreaCommand(CommanAreaDto area) : IRequest<ResponseModel>;
    public class CreateAreaCommandHandler(IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<CreateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateAreaCommand command, CancellationToken cancellationToken)
        {

            if (string.IsNullOrEmpty(command.area.Name))
                return ResponseModel.FailureResponse("Tên khu vực là bắt buộc");

            if (command.area.Latitude < -90 || command.area.Latitude > 90)
                return ResponseModel.FailureResponse("Vĩ độ phải nằm trong khoảng từ -90 đến 90");

            if (command.area.Longitude < -180 || command.area.Longitude > 180)
                return ResponseModel.FailureResponse("Kinh độ phải nằm trong khoảng từ -180 đến 180");

            var isNameExist = await areaDbService.IsNameExistsAsync(command.area.Name);
            if (isNameExist)
                return ResponseModel.FailureResponse("Tên khu vực đã tồn tại");

            var area = new Area(command.area.Name, command.area.Latitude, command.area.Longitude);
            var createAreaResponse = await areaDbService.CreateAsync(area);

            return ResponseModel.SuccessResponse(createAreaResponse);
        }
    }
}
