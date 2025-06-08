
using System.Collections.Generic;
using ResiBuy.Server.Exceptions;

namespace ResiBuy.Server.Infrastructure.DbServices.RoomDbServices
{
    public class RoomDbService : BaseDbService<Room>, IRoomDbService
    {
        private readonly ResiBuyContext _context;

        public RoomDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Room> CreateAsync(Guid buildingId, string name)
        {
            try
            {
                if (string.IsNullOrEmpty(name)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Name is not null");
                var getRoom = await GetByRoomNameAndBuildingIdAsync(buildingId, name);
                if (getRoom != null)
                    throw new CustomException(ExceptionErrorCode.DuplicateValue);
                var room = new Room(name, buildingId); // Updated to match the constructor signature  
                await CreateAsync(room);
                return room;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<Room> GetByRoomNameAndBuildingIdAsync(Guid buildingId, string name)
        {
            try
            {
                return await _context.Rooms.FirstOrDefaultAsync(r => r.BuildingId == buildingId && r.Name == name);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError,ex.Message);
            }
        }

        public async Task<IEnumerable<Room>> GetAllRoomsAsync()
        {
            try
            {
                return await _context.Rooms.Include(r => r.UserRooms).ThenInclude(ur => ur.User).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<IEnumerable<Room>> GetBatchAsync(IEnumerable<Guid> ids)
        {
            try
            {
                // Initialize a list to store the rooms
                var rooms = new List<Room>();

                foreach (var id in ids)
                {
                    if (id == Guid.Empty)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id is not null");
                    }

                    // Fetch the room by ID and add it to the list
                    var room = await GetByIdBaseAsync(id);
                    if (room != null)
                    {
                        rooms.Add(room);
                    }
                }

                return rooms;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
    }
}
