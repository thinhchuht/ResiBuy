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

        public async Task<PagedResult<Room>> GetAllRoomsAsync(int pageNumber, int pageSize, bool? IsActive = null,bool? NoUsers = null)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                var query = _context.Rooms
                    .Include(r => r.UserRooms)
                    .AsQueryable();

                if (IsActive.HasValue)
                {
                    query = query.Where(r => r.IsActive == IsActive.Value);
                }

                if (NoUsers == true)
                {
                    query = query.Where(r => !r.UserRooms.Any());
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(r => r.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
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
        public async Task<Room> GetByIdAsync(Guid id)
        {
            try
            {
                return await _context.Rooms.Include(a => a.UserRooms).ThenInclude(ur => ur.User).FirstOrDefaultAsync(r => r.Id == id);
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

        public async Task<PagedResult<Room>> GetRoomsByBuildingIdPagedAsync(Guid buildingId, int pageNumber, int pageSize, bool? isActive = null, bool? noUsers = null)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                var query = _context.Rooms
                    .Include(r => r.UserRooms)
                    .Where(r => r.BuildingId == buildingId)
                    .AsQueryable();

          
                if (isActive.HasValue)
                    query = query.Where(r => r.IsActive == isActive.Value);


                if (noUsers.HasValue)
                {
                    if (noUsers.Value)
                        query = query.Where(r => !r.UserRooms.Any());
                    else
                        query = query.Where(r => r.UserRooms.Any());
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountAllAsync()
        {
            try
            {
                return await _context.Rooms.CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<int> CountByBuildingIdAsync(Guid buildingId)
        {
            try
            {
                if (buildingId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id tòa nhà không hợp lệ");

                return await _context.Rooms.CountAsync(r => r.BuildingId == buildingId);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

        public async Task<PagedResult<Room>> SearchRoomsByNameAsync(string keyword, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                if (string.IsNullOrWhiteSpace(keyword))
                    keyword = string.Empty;

                var query = _context.Rooms
                    .Where(r => r.Name.Contains(keyword.Trim()))
                    .AsQueryable();

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(r => r.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<PagedResult<Room>> SearchRoomsByNameAndBuildingAsync(Guid buildingId, string keyword, int pageNumber, int pageSize, bool? isActive = null,
    bool? noUsers = null)
        {
            try
            {
                if (buildingId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id tòa nhà không hợp lệ");

                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                var query = _context.Rooms
                    .Include(r => r.UserRooms) // cần include để dùng Any()
                    .Where(r => r.BuildingId == buildingId)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(keyword))
                    query = query.Where(r => r.Name.Contains(keyword.Trim()));

                if (isActive.HasValue)
                    query = query.Where(r => r.IsActive == isActive.Value);

                if (noUsers.HasValue)
                {
                    if (noUsers.Value)
                        query = query.Where(r => !r.UserRooms.Any());
                    else
                        query = query.Where(r => r.UserRooms.Any());
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(r => r.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<PagedResult<Room>> GetRoomsByStatusAsync(bool isActive, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và số phần tử phải lớn hơn 0");

                var query = _context.Rooms
                    .Where(r => r.IsActive == isActive)
                    .OrderBy(r => r.Name);

                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<PagedResult<Room>> GetRoomsByStatusAndBuildingAsync(Guid buildingId, bool isActive, int pageNumber, int pageSize)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Số trang và phần tử phải lớn hơn 0.");

                var query = _context.Rooms
                    .Where(r => r.BuildingId == buildingId && r.IsActive == isActive)
                    .OrderBy(r => r.Name);

                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<Room>(items, totalCount, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<int> CountRoomsByBuildingIdAndStatusAsync(Guid buildingId, bool isActive)
        {
            try
            {
                if (buildingId == Guid.Empty)
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id tòa nhà không hợp lệ");

                return await _context.Rooms
                    .Where(r => r.BuildingId == buildingId && r.IsActive == isActive)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }
        public async Task<IEnumerable<Room>> GetRoomsByUserIdAsync(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                    throw new CustomException(ExceptionErrorCode.ValidationFailed, "UserId không được để trống.");

                var rooms = await _context.UserRooms
                    .Where(ur => ur.UserId == userId)
                    .Include(ur => ur.Room)
                        .ThenInclude(r => r.Building)
                    .Select(ur => ur.Room)
                    .ToListAsync();

                return rooms;
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }
        }

    }

}
