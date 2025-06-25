using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;

namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record UpdateBuildingStatusCommand(Guid BuildingId) : IRequest<ResponseModel>;

    public class UpdateBuildingStatusCommandHandler(
        IBuildingDbService buildingDbService,
        IUserDbService userDbService,
        IAreaDbService areaDbService,
        IKafkaProducerService kafkaProducerService,
        IConfiguration configuration) : IRequestHandler<UpdateBuildingStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateBuildingStatusCommand command,
            CancellationToken cancellationToken)
        {
            try
            {
                var room = await buildingDbService.GetByIdAsync(command.BuildingId);

                if (room == null)
                    return ResponseModel.FailureResponse($"Không tìm thấy phòng với Id: {command.BuildingId}");

                room.UpdateStatus();

                var updatedRoom = await buildingDbService.UpdateAsync(room);

                return ResponseModel.SuccessResponse(updatedRoom);
            }
            catch (CustomException ex)
            {
                return ResponseModel.FailureResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}