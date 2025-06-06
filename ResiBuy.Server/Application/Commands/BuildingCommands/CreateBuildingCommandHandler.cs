namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record CreateBuildingCommand(Guid AreaId, string Name) : IRequest<ResponseModel>;
    public class CreateBuildingCommandHandler(IBuildingDbService buildingDbService, IUserDbService userDbService, IBaseDbService<Area> areaBaseDbService) : IRequestHandler<CreateBuildingCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateBuildingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.AreaId == Guid.Empty) return ResponseModel.FailureResponse("Area is Required");
                var getAreaResponse = await areaBaseDbService.GetByIdAsync(command.AreaId);
                if (!getAreaResponse.IsSuccess()) return ResponseModel.FailureResponse("Area does not exist");
                var area = getAreaResponse.Data as Area;
                var createBuildingResponse = await buildingDbService.CreateAsync(command.Name, command.AreaId);
                if(createBuildingResponse.IsSuccess())
                {
                    var user = User.CreateDefaultAdmin(command.Name, area.Name);
                    var createAdminResponse = await userDbService.CreateAdminUser(user);
                    if(!createAdminResponse.IsSuccess()) return createAdminResponse;
                }
                return createBuildingResponse;
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
