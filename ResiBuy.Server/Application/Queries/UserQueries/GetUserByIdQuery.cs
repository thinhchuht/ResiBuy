namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetUserByIdQuery(string UserId) : IRequest<ResponseModel>;
    public class GetUserQueryHandler(IUserService userService) : IRequestHandler<GetUserByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetUserByIdQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(query.UserId)) return ResponseModel.FailureResponse("User is not exist");
            return await userService.GetUserById(query.UserId);
        }
    }
}
