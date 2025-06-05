namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetUserByIdQuery(string UserId) : IRequest<ResponseModel>;
    public class GetUserQueryHandler(IUserService userService) : IRequestHandler<GetUserByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetUserByIdQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(query.UserId)) return ResponseModel.FailureResponse("User is not exist");
            var user = (await userService.GetUserById(query.UserId)).Data as User;
            return ResponseModel.SuccessResponse(new UserQueryResult(user.Id, user.DateOfBirth, user.IsLocked, user.Roles, user.FullName,
                user.CreatedAt, user.UpdatedAt, user.Cart.Id, user.UserRooms.Select(ur => new { ur.RoomId, ur.Room.Name, ur.Room.BuildingId }),
                user.UserVouchers.Select(ur => ur.VoucherId), user.Reports));
        }
    }
}
