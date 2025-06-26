namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record UpdateRoomStatusCommand(Guid RoomId) : IRequest<ResponseModel>;
    public class UpdateRoomStatusCommandHandler(IRoomDbService roomDbService)
        : IRequestHandler<UpdateRoomStatusCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateRoomStatusCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var room = await roomDbService.GetByIdAsync(command.RoomId);

                if (room == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy phòng với Id: {command.RoomId}");

                room.UpdateStatus();

                var updatedRoom = await roomDbService.UpdateAsync(room);

                return ResponseModel.SuccessResponse(updatedRoom);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
