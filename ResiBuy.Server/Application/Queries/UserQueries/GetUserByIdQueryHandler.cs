﻿namespace ResiBuy.Server.Application.Queries.UserQueries
{
    public record GetUserByIdQuery(string UserId) : IRequest<ResponseModel>;
    public class GetUserQueryHandler(IUserDbService UserDbService) : IRequestHandler<GetUserByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetUserByIdQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(query.UserId)) throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy người dùng");
            var user = (await UserDbService.GetUserById(query.UserId));
            return ResponseModel.SuccessResponse(new UserQueryResult(user.Id, user.IdentityNumber, user.Email, user.PhoneNumber, user.DateOfBirth, user.IsLocked, user.Roles, user.FullName,
                user.CreatedAt, user.UpdatedAt, user.Cart == null ? null : user.Cart.Id, user.Avatar != null ? new AvatarQueryResult(user.Avatar.Id, user.Avatar.Name, user.Avatar.Url, user.Avatar.ThumbUrl) : null, user.UserRooms.Select(ur => new RoomQueryResult(ur.RoomId, ur.Room.Name, ur.Room.Building.Name, ur.Room.Building.Area.Name)),
                user.UserVouchers.Select(ur => ur.VoucherId), user.Reports, user.Stores.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.PhoneNumber,
                    s.IsLocked
                })));
        }
    }
}
