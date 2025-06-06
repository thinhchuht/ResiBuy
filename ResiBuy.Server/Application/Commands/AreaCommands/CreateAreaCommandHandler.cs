namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record CreateAreaCommand(string Name) : IRequest<ResponseModel>;
    public class CreateAreaCommandHandler(IBaseDbService<Area> BaseDbService) : IRequestHandler<CreateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateAreaCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrEmpty(command.Name)) return ResponseModel.FailureResponse("Name is Required");
                var area = new Area(command.Name);
                var createAreaResponse = await BaseDbService.CreateAsync(area);
                return createAreaResponse;
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
