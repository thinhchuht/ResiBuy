namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetAllUsersQuery : IRequest<ResponseModel>;
    public class GetAllUsersQueryHandler(IUserDbService UserDbService) : IRequestHandler<GetAllUsersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
        {
            var users = (await UserDbService.GetAllUsers());
            return ResponseModel.SuccessResponse(users.Select(user => new UserQueryResult(user.Id, user.DateOfBirth, user.IsLocked, 
                user.Roles,user.FullName, user.CreatedAt, user.UpdatedAt, user.Cart?.Id ?? Guid.Empty,
                user.UserRooms.Select(ur => new
                { ur.RoomId, RoomName = ur.Room?.Name, BuildingId = ur.Room?.BuildingId}),
                user.UserVouchers.Select(uv => uv.VoucherId),
                user.Reports
                )));
        }
    }
}
