namespace ResiBuy.Server.Application.Commands.AreaCommands
{
    public record CreateAreaCommand(string Name) : IRequest<ResponseModel>;
    public class CreateAreaCommandHandler(BaseService<Area> baseService) : IRequestHandler<CreateAreaCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateAreaCommand command, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrEmpty(command.Name)) return ResponseModel.FailureResponse("Name is Required");
                var area = new Area(command.Name);
                 await baseService.CreateAsync(area);

                if (area == null)
                    return ResponseModel.FailureResponse("Cannot create area.");

                return ResponseModel.SuccessResponse(area);
            }
            catch (Exception)
            {
                return ResponseModel.ExceptionResponse();
            }
        }
    }
}
