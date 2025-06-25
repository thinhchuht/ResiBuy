using ResiBuy.Server.Application.Commands.AreaCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record UpdateAreaCommand( UpdateAreaDto UpdateAreaDto) : IRequest<ResponseModel>;

    public class UpdateAreaCommandHandler(IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<UpdateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateAreaCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.UpdateAreaDto;

                if (dto == null)
                    return ResponseModel.FailureResponse("Update data is required");

                if (dto.Id == Guid.Empty)
                    return ResponseModel.FailureResponse("Id is required");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    return ResponseModel.FailureResponse("Name is required");

                var existingArea = await areaDbService.GetByIdAsync(dto.Id);
                if (existingArea == null)
                    return ResponseModel.FailureResponse($"Area {dto.Id} không tồn tại");

                existingArea.UpdateArea(dto.Name, dto.IsActive);
                var updateAreaResponse = await areaDbService.UpdateAsync(existingArea);

                return ResponseModel.SuccessResponse(dto);
            }
            catch (Exception e)
            {
                return ResponseModel.ExceptionResponse(e.ToString());
            }
        }

    }
}
