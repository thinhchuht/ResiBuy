﻿namespace ResiBuy.Server.Application.Queries.RoomQueries
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

                return ResponseModel.SuccessResponse(room);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}