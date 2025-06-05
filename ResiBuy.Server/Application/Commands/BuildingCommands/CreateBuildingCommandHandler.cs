namespace ResiBuy.Server.Application.Commands.BuildingCommands
{
    public record CreateBuildingCommand(Guid AreaId, string Name) : IRequest<ResponseModel>;
    public class CreateBuildingCommandHandler(IBuildingService buildingService, IBaseService<Area> areaBaseService) : IRequestHandler<CreateBuildingCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateBuildingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.AreaId == Guid.Empty) return ResponseModel.FailureResponse("Area is Required");
                var getAreaResponse = await areaBaseService.GetByIdAsync(command.AreaId);
                if (!getAreaResponse.IsSuccess()) return ResponseModel.FailureResponse("Area does not exist");
                return await buildingService.CreateAsync(command.Name, command.AreaId);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
