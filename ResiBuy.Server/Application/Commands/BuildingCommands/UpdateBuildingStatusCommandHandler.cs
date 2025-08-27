using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;
using ResiBuy.Server.Infrastructure.Model;

namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record UpdateBuildingStatusCommand(Guid BuildingId) : IRequest<ResponseModel>;

    public class UpdateBuildingStatusCommandHandler(
        ResiBuyContext context,
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
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy phòng với Id: {command.BuildingId}");

                room.UpdateStatus();

                var updatedRoom = await buildingDbService.UpdateAsync(room);
                if (room.Rooms.Count() > 0 && room.IsActive == false)
                {
                    foreach (var rom in room.Rooms)
                    {
                        rom.IsActive = false;
                        if (rom.Stores.Count() > 0)
                        {
                            foreach (var store in rom.Stores)
                            {
                                store.IsLocked = true;
                                store.IsOpen = false;
                            }
                        }
                    }
                }
                context.SaveChanges();

                return ResponseModel.SuccessResponse(new
                {
                    id = updatedRoom.Id,
                    name = updatedRoom.Name,
                    isActive = updatedRoom.IsActive
                });
            }
         
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}