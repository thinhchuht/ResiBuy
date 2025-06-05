namespace ResiBuy.Server.Infrastructure.Services.RoomServices
{
    public class RoomService(ResiBuyContext context) : IRoomService
    {
        public async Task<ResponseModel> CreateAsync(Guid buildingId, string name)
        {
            try
            {
                if (string.IsNullOrEmpty(name)) return ResponseModel.FailureResponse("Name is Required");
                var getRoomResponse = await GetByRoomIdOrNameAsync(buildingId, name);
                if (getRoomResponse.IsSuccess())
                    return ResponseModel.FailureResponse("Room is already exists in this building");
                var room = (getRoomResponse.Data as List<Room>).First();
                await context.AddAsync(room);
                await context.SaveChangesAsync();
                return ResponseModel.SuccessResponse(room);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> GetByRoomIdOrNameAsync(Guid buildingId, string name)
        {
            try
            {
                var query = context.Rooms.AsQueryable();

                if (!buildingId.Equals(Guid.Empty))
                    query = query.Where(u => u.BuildingId == buildingId);

                if (!string.IsNullOrEmpty(name))
                    query = query.Where(u => u.Name == name);
                var rooms = await query.ToListAsync();
                if (!rooms.Any())
                    return ResponseModel.FailureResponse("Room not found");
                return ResponseModel.SuccessResponse(rooms);
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }

        public async Task<ResponseModel> GetAllRoomsAsync()
        {
            try
            {
                return ResponseModel.SuccessResponse(await context.Rooms.Include(a => a.UserRooms).ThenInclude(ur => ur.User).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel.ExceptionResponse(ex.ToString());
            }
        }
    }
}
