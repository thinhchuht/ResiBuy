namespace ResiBuy.Server.Infrastructure.DbServices.UserRoomDbServices
{
    public class UserRoomDbService : BaseDbService<UserRoom>, IUserRoomDbService
    {
        private readonly ResiBuyContext _context;

        public UserRoomDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<UserRoom> CreateUserRoom(string userId, Guid roomId)
        {
            try
            {
                var userRoom = await _context.UserRooms.FirstOrDefaultAsync(ur => ur.UserId.Equals(userId) && ur.RoomId.Equals(roomId));
                if (userRoom != null)
                    throw new CustomException(ExceptionErrorCode.DuplicateValue);

                var newUserRoom = new UserRoom { UserId = userId, RoomId = roomId };
                await _context.UserRooms.AddAsync(newUserRoom);
                await _context.SaveChangesAsync();
                return newUserRoom;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<UserRoom>> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds)
        {
            try
            {
                var userRooms = new List<UserRoom>();
                foreach (var userId in userIds)
                {
                    foreach (var roomId in roomIds)
                    {
                        userRooms.Add(new UserRoom(userId, roomId));
                    }
                }
                await CreateBatchAsync(userRooms);
                return userRooms;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task DeleteUserRoom(string userId, Guid roomId)
        {
            try
            {
                var userRoom = await _context.UserRooms
                    .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoomId == roomId);

                if (userRoom != null)
                {
                     _context.UserRooms.Remove(userRoom);
                }
               await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
