using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;

namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record UpdateAreaStatusCommand(Guid Id) : IRequest<ResponseModel>;

    public class UpdateAreaStatusCommandHandler(
        ResiBuyContext context,
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
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id không hợp lệ");

                var existingArea = await areaDbService.GetByIdAsync(command.Id);
                if (existingArea == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy Area với Id: {command.Id}");

                existingArea.IsActive = !existingArea.IsActive;

                var updatedArea = await areaDbService.UpdateAsync(existingArea);
                if (!existingArea.IsActive && existingArea.Buildings.Count() > 0)
                {
                    foreach (var building in existingArea.Buildings)
                    {
                        building.IsActive = false;
                        if (building.Rooms.Count() > 0)
                        {
                            foreach (var room in building.Rooms)
                            {
                                room.IsActive = false;
                                if (room.Stores.Count() > 0)
                                {
                                    foreach(var store in room.Stores)
                                    {
                                        store.IsLocked = true;
                                        store.IsOpen = false;
                                    }
                                }
                            }
                        }
                    }
                }
                context.SaveChanges();

                return ResponseModel.SuccessResponse(new
                {
                    Id = updatedArea.Id,
                    IsActive = updatedArea.IsActive
                });
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
