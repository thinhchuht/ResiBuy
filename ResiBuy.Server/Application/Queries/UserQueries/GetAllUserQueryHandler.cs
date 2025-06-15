namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;
    public class GetAllUsersQueryHandler(IUserDbService UserDbService) : IRequestHandler<GetAllUsersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
        {
            var pagedResult = await UserDbService.GetAllUsers(query.PageNumber, query.PageSize);
            return ResponseModel.SuccessResponse(pagedResult);
        }
    }
}
