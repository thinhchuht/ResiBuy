using ResiBuy.Server.Application.Commands.BuildingCommands.DTOs;

namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record UpdateBuildingCommand(UpdateBuildingDto BuildingDto) : IRequest<ResponseModel>;

    public class UpdateBuildingCommandHandler(IBuildingDbService buildingDbService, IUserDbService userDbService, IAreaDbService areaDbService, IKafkaProducerService kafkaProducerService, IConfiguration configuration) : IRequestHandler<UpdateBuildingCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(UpdateBuildingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.BuildingDto;
                if (dto == null)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Dữ liệu cập nhật là bắt buộc");

                if (dto.Id == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id là bắt buộc");

                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên là bắt buộc");

                if (dto.AreaId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id khu vực");

                var area = await areaDbService.GetByIdAsync(dto.AreaId)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, "Khu vực không tồn tại");

                if (!area.IsActive)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Khu vực không hoạt động");
                var existingBuilding = await buildingDbService.GetByIdAsync(dto.Id)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, $"Building với Id {dto.Id} không tồn tại");
                existingBuilding.Name = dto.Name;
                existingBuilding.AreaId = dto.AreaId;
                existingBuilding.IsActive = dto.IsActive;
                var updatedBuilding = await buildingDbService.UpdateAsync(existingBuilding);
                return ResponseModel.SuccessResponse(dto);
            }
           
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}

