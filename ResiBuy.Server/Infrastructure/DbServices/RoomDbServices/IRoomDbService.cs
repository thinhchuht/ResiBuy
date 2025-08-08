namespace ResiBuy.Server.Infrastructure.DbServices.RoomDbServices
{
    public interface IRoomDbService: IBaseDbService<Room>
    {
        Task<Room> GetByIdAsync(Guid id);
        Task<PagedResult<Room>> GetAllRoomsAsync(int pageNumber, int pageSize, bool? IsActive = null,bool? NoUsers = null);
        Task<Room?> GetByNameAsync(string name);

        Task<PagedResult<Room>> GetRoomsByBuildingIdPagedAsync(Guid buildingId, int pageNumber, int pageSize, bool? isActive = null, bool? hasUsers = null);

        Task<IEnumerable<Room>> GetBatchAsync(IEnumerable<Guid> Ids);
        Task<Room> CreateAsync(Guid buildingId, string name);
        Task<Room> GetByRoomNameAndBuildingIdAsync(Guid buildingId, string name);
        Task<int> CountAllAsync();
        Task<int> CountByBuildingIdAsync(Guid buildingId);
        Task<PagedResult<Room>> SearchRoomsByNameAsync(string keyword, int pageNumber, int pageSize);
        Task<PagedResult<Room>> SearchRoomsByNameAndBuildingAsync(Guid buildingId, string keyword, int pageNumber, int pageSize, bool? IsActive = null, bool? NoUsers = null);
        Task<PagedResult<Room>> GetRoomsByStatusAsync(bool isActive, int pageNumber, int pageSize);
        Task<PagedResult<Room>> GetRoomsByStatusAndBuildingAsync(Guid buildingId, bool isActive, int pageNumber, int pageSize);
        Task<int> CountRoomsByBuildingIdAndStatusAsync(Guid buildingId, bool isActive);
        Task<IEnumerable<Room>> GetRoomsByUserIdAsync(string userId);

    }
}