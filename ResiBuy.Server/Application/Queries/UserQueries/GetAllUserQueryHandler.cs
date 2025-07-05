namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;
    public class GetAllUsersQueryHandler(IUserDbService UserDbService) : IRequestHandler<GetAllUsersQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
        {
            if (query.PageNumber < 1 || query.PageSize < 1)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");
            var pagedResult = await UserDbService.GetAllUsers(query.PageNumber, query.PageSize);
            if (pagedResult == null || !pagedResult.Items.Any())
            {
                return ResponseModel.SuccessResponse(new PagedResult<UserQueryResult>(new List<UserQueryResult>(), pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize));
            }
            var items = pagedResult.Items.Select(user => new UserQueryResult(
                user.Id,
                user.IdentityNumber,
                user.Email,
                user.PhoneNumber,
                user.DateOfBirth,
                user.IsLocked,
                user.Roles,
                user.FullName,
                user.CreatedAt,
                user.UpdatedAt,
                user.Cart?.Id ?? null,
                user.Avatar != null ? new AvatarQueryResult(
                    user.Avatar.Id,
                    user.Avatar.Name,
                    user.Avatar.Url,
                    user.Avatar.ThumbUrl) : null,
                user.UserRooms.Select(ur => new RoomQueryResult(
                    ur.RoomId,
                    ur.Room?.Name,
                    ur.Room?.Building.Name,
                    ur.Room?.Building.Area.Name)),
                user.UserVouchers.Select(uv => uv.VoucherId),
                user.Reports.ToList(),
                user.Stores.Select(s => new
                {
                    s.Id,
                    s.Name,
                })
            )).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<UserQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize));
        }
    }
}
