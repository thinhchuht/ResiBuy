using ResiBuy.Server.Application.Commands.RoomCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record UpdateRoomCommand(UpdateRoomDto RoomDto) : IRequest<ResponseModel>;

    public class UpdateRoomCommandHandler(IRoomDbService roomDbService)
        : IRequestHandler<UpdateRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.RoomDto;

                if (dto == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Dữ liệu cập nhật không được để trống.");

                if (dto.Id == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id phòng không hợp lệ.");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên phòng là bắt buộc.");

                var existingRoom = await roomDbService.GetByIdAsync(dto.Id);

                if (existingRoom == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy phòng có Id: {dto.Id}");
                existingRoom.UpdateRoom(dto.Name, dto.IsActive);

                var result = await roomDbService.UpdateAsync(existingRoom);

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
