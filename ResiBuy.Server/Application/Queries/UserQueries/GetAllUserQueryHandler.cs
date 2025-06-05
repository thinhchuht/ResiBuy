namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetAllUsersQuery : IRequest<ResponseModel>;
    public class GetAllUsersQueryHandler(IUserService userService) : IRequestHandler<GetAllUsersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
        {
            var users = (await userService.GetAllUsers()).Data as IEnumerable<User>;
            return ResponseModel.SuccessResponse(users.Select(user => new UserQueryResult(user.Id, user.DateOfBirth, 
                user.IsLocked, user.Roles, user.FullName,
                user.CreatedAt, user.UpdatedAt, user.Cart.Id, user.UserRooms.Select(ur => new { ur.RoomId, ur.Room.Name, ur.Room.BuildingId }), user.UserVouchers.Select(ur => ur.VoucherId), user.Reports)));
        }
    }
}
