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
                    return ResponseModel.FailureResponse("Dữ liệu cập nhật không được để trống.");

                if (dto.Id == Guid.Empty)
                    return ResponseModel.FailureResponse("Id phòng không hợp lệ.");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    return ResponseModel.FailureResponse("Tên phòng là bắt buộc.");

                var existingRoom = await roomDbService.GetByIdAsync(dto.Id);

                if (existingRoom == null)
                    return ResponseModel.FailureResponse($"Không tìm thấy phòng có Id: {dto.Id}");
                existingRoom.UpdateRoom(dto.Name, dto.IsActive);

                var result = await roomDbService.UpdateAsync(existingRoom);

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
