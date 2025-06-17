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
                if (buildingId == Guid.Empty) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Cần Id toàn nhà");
                if (string.IsNullOrEmpty(name)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên tòa nhà là bắt buộc");
                var getRoom = await GetByRoomNameAndBuildingIdAsync(buildingId, name);
                if (getRoom != null)
                    throw new CustomException(ExceptionErrorCode.DuplicateValue, "Phòng đã tồn tại");
                var room = new Room(name, buildingId); 
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

        public async Task<Room> GetRoomDetail(Guid id)
        {
            try
            {

                var room = await _context.Rooms.Include(r => r.Building).ThenInclude(b => b.Area).FirstOrDefaultAsync(r => r.Id == id);
                return room;
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
                var rooms = new List<Room>();
                foreach (var id in ids)
                {
                    if (id == Guid.Empty)
                    {
                        throw new CustomException(ExceptionErrorCode.ValidationFailed, $"Không có Id phòng: {id}");
                    }
                    var room = await GetRoomDetail(id);
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
