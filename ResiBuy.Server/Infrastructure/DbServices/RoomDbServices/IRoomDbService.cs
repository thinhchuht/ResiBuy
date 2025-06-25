namespace ResiBuy.Server.Infrastructure.DbServices.RoomDbServices
{
    public interface IRoomDbService: IBaseDbService<Room>
    {
        Task<Room> GetByIdAsync(Guid id);
        Task<IEnumerable<Room>> GetAllRoomsAsync();
        Task<IEnumerable<Room>> GetByBuildingIdAsync(Guid id);
        Task<IEnumerable<Room>> GetBatchAsync(IEnumerable<Guid> Ids);
        Task<Room> CreateAsync(Guid buildingId, string name);
        Task<Room> GetByRoomNameAndBuildingIdAsync(Guid buildingId, string name);
        Task<int> CountAllAsync();
        Task<int> CountByBuildingIdAsync(Guid buildingId);
    }
}