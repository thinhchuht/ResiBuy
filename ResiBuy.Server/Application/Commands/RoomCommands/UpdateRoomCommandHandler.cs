

using ResiBuy.Server.Application.Commands.RoomCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record UpdateRoomCommand(UpdateRoomDto RoomDto) : IRequest<ResponseModel>;

    public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, ResponseModel>
    {
        private readonly IRoomDbService roomDbService;

        public UpdateRoomCommandHandler(IRoomDbService roomDbService)
        {
            this.roomDbService = roomDbService;
        }

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
                var roomWithSameName = await roomDbService.GetByNameAsync(dto.Name);
                if (roomWithSameName != null && roomWithSameName.Id != dto.Id)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên phòng đã được sử dụng bởi một phòng khác.");

                var result = await roomDbService.UpdateAsync(existingRoom);

                return ResponseModel.SuccessResponse(dto);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}