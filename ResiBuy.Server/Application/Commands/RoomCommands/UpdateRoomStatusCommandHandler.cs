namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record UpdateRoomStatusCommand(Guid RoomId) : IRequest<ResponseModel>;
    public class UpdateRoomStatusCommandHandler(IRoomDbService roomDbService, ResiBuyContext context)
        : IRequestHandler<UpdateRoomStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateRoomStatusCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var room = await roomDbService.GetByIdAsync(command.RoomId);

                if (room == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy phòng với Id: {command.RoomId}");
                if (!room.Building.IsActive)
                {
                    throw new CustomException(ExceptionErrorCode.UpdateFailed, "Buiding không hoạt động");
                }
                room.UpdateStatus();

                var updatedRoom = await roomDbService.UpdateAsync(room);

                if(room.IsActive == false && room.Stores.Count() > 0)
                {
                    foreach(var store in room.Stores)
                    {
                        store.IsLocked = true;
                        store.IsOpen = false;
                    }
                }
                context.SaveChanges();
                return ResponseModel.SuccessResponse(updatedRoom);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
