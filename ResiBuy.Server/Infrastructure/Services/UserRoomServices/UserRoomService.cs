namespace ResiBuy.Server.Infrastructure.Services.UserRoomServices
{
    public class UserRoomService(ResiBuyContext context) : IUserRoomService
    {
        public async Task<ResponseModel> CreateUserRoom(string userId, Guid roomId)
        {
            try
            {
                var userRoom = await context.UserRooms.FirstOrDefaultAsync(ur => ur.UserId.Equals(userId) && ur.RoomId.Equals(roomId));
                if (userRoom == null) ResponseModel.FailureResponse("Cannot create another user in this room");
                var newUserRoom = new UserRoom(userId, roomId);
                await context.UserRooms.AddAsync(newUserRoom);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(newUserRoom);
            }
            catch (Exception ex)
            {
                ResponseModel.ExceptionResponse(ex.ToString());
            }
            return ResponseModel.FailureResponse("Cannot create another user in this room");
        }

        public async Task<ResponseModel> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds)
        {
            try
            {
                if (!userIds.Any() || !roomIds.Any())
                    return ResponseModel.FailureResponse("No thing to create");

                var existingUserRooms = await context.UserRooms
                    .Where(ur => userIds.Contains(ur.UserId) && roomIds.Contains(ur.RoomId))
                    .Select(ur => new { ur.UserId, ur.RoomId })
                    .ToListAsync();

                var newUserRooms = userIds
                    .SelectMany(userId => roomIds.Select(roomId => new { userId, roomId }))
                    .Where(pair => !existingUserRooms.Any(e => e.UserId == pair.userId && e.RoomId == pair.roomId))
                    .Select(pair => new UserRoom(pair.userId, pair.roomId))
                    .ToList();

                if (!newUserRooms.Any())
                    return ResponseModel.FailureResponse("All user-room pairs already exist");

                await context.UserRooms.AddRangeAsync(newUserRooms);
                await context.SaveChangesAsync();

                return ResponseModel.SuccessResponse(newUserRooms);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.Message);
            }
        }
    }
}
