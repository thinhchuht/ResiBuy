namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record SearchUserQuery(string Keyword, int PageNumber = 1, int PageSize = 10) : IRequest<ResponseModel>;
    public class SearchUserQueryHandler(IUserDbService UserDbService) : IRequestHandler<SearchUserQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(SearchUserQuery query, CancellationToken cancellationToken)
        {
            if (query.PageNumber < 1 || query.PageSize < 1)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");
            if (string.IsNullOrEmpty(query.Keyword)) return ResponseModel.SuccessResponse(new PagedResult<UserQueryResult>(new List<UserQueryResult>(), 0, query.PageNumber, query.PageSize));
            var pagedResult = await UserDbService.SearchUsers(query.Keyword, query.PageNumber, query.PageSize);
            if (pagedResult == null || !pagedResult.Items.Any())
            {
                return ResponseModel.SuccessResponse(new PagedResult<UserQueryResult>(new List<UserQueryResult>(), 0, query.PageNumber, query.PageSize));
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
                    ur.Room?.Building.Area.Name, ur.Room.Building.Area.Id)),
                user.UserVouchers.Select(uv => uv.VoucherId),
                user.Reports.Select(r => new ReportQueryResult(r.Id, r.IsResolved, r.Title, r.Description, r.CreatedAt, r.CreatedById, r.ReportTarget, r.TargetId, r.OrderId)),
                user.Stores.Select(s => new
                {
                     s.Id,
                     s.Name,
                     s.PhoneNumber,
                }),
                user.ReportCount
            )).ToList();
            return ResponseModel.SuccessResponse(new PagedResult<UserQueryResult>(items, pagedResult.TotalCount, pagedResult.PageNumber, pagedResult.PageSize));
        }
    }
}
