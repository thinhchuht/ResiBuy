namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetCustomerByPhoneQuery(string PhoneNumber) : IRequest<ResponseModel>;

    public class GetCustomerByPhoneQueryHandler(IUserDbService userDbService)
        : IRequestHandler<GetCustomerByPhoneQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCustomerByPhoneQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(query.PhoneNumber))
                throw new CustomException(ExceptionErrorCode.RepositoryError, "Số điện thoại không hợp lệ");

            var user = await userDbService.GetCustomerByPhoneAsync(query.PhoneNumber);

            if (user == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy khách hàng");

            if (!user.Roles.Contains(Constants.CustomerRole))
                throw new CustomException(ExceptionErrorCode.Forbidden, "Người dùng không phải là khách hàng");

            return ResponseModel.SuccessResponse(new UserQueryResult(
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
                user.Cart == null ? null : user.Cart.Id,
                user.Avatar != null
                    ? new AvatarQueryResult(user.Avatar.Id, user.Avatar.Name, user.Avatar.Url, user.Avatar.ThumbUrl)
                    : null,
                user.UserRooms.Select(ur => new RoomQueryResult(
                    ur.RoomId,
                    ur.Room.Name,
                    ur.Room.Building.Name,
                    ur.Room.Building.Area.Name,
                    ur.Room.Building.Area.Id
                )),
                user.UserVouchers.Select(ur => ur.VoucherId),
                user.Reports.Select(r => new ReportQueryResult(
                    r.Id,
                    r.IsResolved,
                    r.Title,
                    r.Description,
                    r.CreatedAt,
                    r.CreatedById,
                    r.ReportTarget,
                    r.TargetId,
                    r.OrderId
                )),
                user.Stores.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.PhoneNumber,
                    s.IsLocked
                }),
                user.ReportCount,
                null // shipperIsLocked không cần cho customer
            ));
        }
    }
}
