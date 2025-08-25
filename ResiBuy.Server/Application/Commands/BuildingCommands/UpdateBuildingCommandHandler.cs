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

                
                var existingBuilding = await buildingDbService.GetByIdAsync(dto.Id)
                    ?? throw new CustomException(ExceptionErrorCode.NotFound, $"Building với Id {dto.Id} không tồn tại");
                existingBuilding.Name = dto.Name;
                var existingBuildingWithName = await buildingDbService.GetBuildingByNameAndAreaIdAssync(dto.Name, existingBuilding.AreaId);
                if (existingBuildingWithName != null && existingBuildingWithName.Id != dto.Id)
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, $"Tòa nhà với tên {dto.Name} đã tồn tại trong khu vực");
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

