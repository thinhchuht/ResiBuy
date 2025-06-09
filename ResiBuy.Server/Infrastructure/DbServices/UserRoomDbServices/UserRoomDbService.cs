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
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
            }
        }

        public async Task<IEnumerable<UserRoom>> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds)
        {
            try
            {
                if (!userIds.Any() || !roomIds.Any())
                    throw new CustomException(ExceptionErrorCode.InvalidInput);

                var existingUserRooms = await _context.UserRooms
                    .Where(ur => userIds.Contains(ur.UserId) && roomIds.Contains(ur.RoomId))
                    .Select(ur => new { ur.UserId, ur.RoomId })
                    .ToListAsync();

                var existingSet = new HashSet<string>(
                    existingUserRooms.Select(e => $"{e.UserId}-{e.RoomId}")
                );

                var newUserRooms = userIds
                    .SelectMany(userId => roomIds.Select(roomId => new { userId, roomId }))
                    .Where(pair => !existingSet.Contains($"{pair.userId}-{pair.roomId}"))
                    .Select(pair => new UserRoom { UserId = pair.userId, RoomId = pair.roomId })
                    .ToList();

                if (!newUserRooms.Any())
                    throw new CustomException(ExceptionErrorCode.DuplicateValue);

                await _context.UserRooms.AddRangeAsync(newUserRooms);
                await _context.SaveChangesAsync();

                return newUserRooms;
            }
            catch (CustomException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }
}
