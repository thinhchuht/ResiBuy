namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record CreateBuildingCommand(Guid AreaId, string Name) : IRequest<ResponseModel>;
    public class CreateBuildingCommandHandler(IBuildingDbService buildingDbService, IUserDbService userDbService,IAreaDbService areaDbService) : IRequestHandler<CreateBuildingCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateBuildingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.AreaId == Guid.Empty) return ResponseModel.FailureResponse("Area is Required");
                if (string.IsNullOrEmpty(command.Name)) return ResponseModel.FailureResponse("Name is Required");
                var building = await buildingDbService.CreateAsync(command.Name, command.AreaId);
                var area = await areaDbService.GetByIdAsync(command.AreaId);
                if (building != null)
                {
                    var user = User.CreateDefaultAdmin(command.Name, area.Name);
                    var admin = await userDbService.CreateAdminUser(user);
                    if(admin != null)
                    {
                        return ResponseModel.SuccessResponse(building);
                    }
                    else
                    {
                        return ResponseModel.FailureResponse("Building created but failed to create admin user.");
                    }
                }
                return ResponseModel.FailureResponse("Failed to create building.");
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
