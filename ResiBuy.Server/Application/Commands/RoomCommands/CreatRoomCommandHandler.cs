﻿namespace ResiBuy.Server.Application.Commands.RoomCommands
{
    public record CreateRoomCommand(Guid BuildingId, string Name) : IRequest<ResponseModel>;
    public class CreateRoomCommandHandler(IRoomDbService RoomDbService, IBuildingDbService BuildingDbService) : IRequestHandler<CreateRoomCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateRoomCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (command.BuildingId == Guid.Empty) return ResponseModel.FailureResponse("Building is Required");
                var getBuildingResponse = await BuildingDbService.GetByIdAsync(command.BuildingId);
                if(!getBuildingResponse.IsSuccess()) return ResponseModel.FailureResponse("Building does not exist");
                var createRoom = await RoomDbService.CreateAsync(command.BuildingId, command.Name);
                return createRoom;
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
