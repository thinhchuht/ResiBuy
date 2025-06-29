namespace ResiBuy.Server.Application.Commands.CartCommands
{
    public record ResetStatusCommand(List<Guid> Ids) : IRequest<ResponseModel>;
    public class ResetStatusCommandHandler(ICartDbService cartDbService) : IRequestHandler<ResetStatusCommand, ResponseModel>
    {
        public Task<ResponseModel> Handle(ResetStatusCommand command, CancellationToken cancellationToken)
        {
            return cartDbService.ResetStatus(command.Ids);
        }
    }
}
