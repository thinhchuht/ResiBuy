namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record CreateRoomCommand(Guid BuildingId, string Name) : IRequest<ResponseModel>;
    public class CreateRoomCommandHandler(IRoomDbService RoomDbService, IBuildingDbService BuildingDbService) : IRequestHandler<CreateRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var building = await BuildingDbService.GetByIdAsync(command.BuildingId) ?? throw new CustomException(ExceptionErrorCode.NotFound, "Tòa nhà không tồn tại");
                if(!building.IsActive) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tòa nhà không hoạt động");
                var createRoom = await RoomDbService.CreateAsync(command.BuildingId, command.Name);
                return ResponseModel.SuccessResponse(createRoom);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
