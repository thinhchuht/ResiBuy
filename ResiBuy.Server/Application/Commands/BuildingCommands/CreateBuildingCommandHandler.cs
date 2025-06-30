namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record CreateBuildingCommand(Guid AreaId, string Name) : IRequest<ResponseModel>;
    public class CreateBuildingCommandHandler(IBuildingDbService buildingDbService, IUserDbService userDbService, IAreaDbService areaDbService) : IRequestHandler<CreateBuildingCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateBuildingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.AreaId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id toàn nhà");
                var area = await areaDbService.GetByIdAsync(command.AreaId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Tòa nhà không tồn tại");
                if (!area.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tòa nhà không hoạt động");
                var building = await buildingDbService.CreateAsync(command.Name, command.AreaId);
                    var user = User.CreateDefaultAdmin(command.Name, area.Name);
                    var admin = await userDbService.CreateAdminUser(user);
                    if (admin != null)
                        return ResponseModel.SuccessResponse(building);
                    else
                        return ResponseModel.FailureResponse("Khởi tạo Admin thất bại.");
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
