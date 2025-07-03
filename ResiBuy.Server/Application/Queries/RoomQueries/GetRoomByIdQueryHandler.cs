namespace ResiBuy.Server.Application.Queries.RoomQueries
{
    public record GetRoomByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetRoomByIdQueryHandler(IRoomDbService roomDbService)
        : IRequestHandler<GetRoomByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var room = await roomDbService.GetByIdAsync(request.Id);

                if (room == null)
                    throw new CustomException(ExceptionErrorCode.NotFound, $"Không tìm thấy phòng với Id: {request.Id}");

                var result = new
                {
                    room.Id,
                    room.Name,
                    room.IsActive,
                    room.BuildingId,
                    Users = room.UserRooms?
                        .Where(ur => ur.User != null)
                        .Select(ur => new
                        {
                            ur.User.Id,
                            ur.User.Email,
                            ur.User.PhoneNumber,
                            ur.User.FullName,
                            ur.User.DateOfBirth,
                            ur.User.Roles,
                            ur.User.IsLocked,
                            ur.User.CreatedAt,
                            ur.User.UpdatedAt,
                            ur.User.EmailConfirmed,
                            ur.User.PhoneNumberConfirmed
                        })
                };

                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}