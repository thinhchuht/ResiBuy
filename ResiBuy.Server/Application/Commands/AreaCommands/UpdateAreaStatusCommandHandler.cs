using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record UpdateAreaStatusCommand(Guid Id) : IRequest<ResponseModel>;

    public class UpdateAreaStatusCommandHandler(
        IAreaDbService areaDbService,
        IKafkaProducerService kafkaProducerService,
        IConfiguration configuration)
        : IRequestHandler<UpdateAreaStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateAreaStatusCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.Id == Guid.Empty)
                    return ResponseModel.FailureResponse("Id không hợp lệ");

                var existingArea = await areaDbService.GetByIdAsync(command.Id);
                if (existingArea == null)
                    return ResponseModel.FailureResponse($"Không tìm thấy Area với Id: {command.Id}");

                existingArea.IsActive = !existingArea.IsActive;

                var updatedArea = await areaDbService.UpdateAsync(existingArea);

                return ResponseModel.SuccessResponse(new
                {
                    Id = updatedArea.Id,
                    IsActive = updatedArea.IsActive
                });
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
