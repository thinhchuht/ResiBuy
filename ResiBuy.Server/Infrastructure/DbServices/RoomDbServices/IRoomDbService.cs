namespace ResiBuy.Server.Infrastructure.DbServices.RoomDbServices
{
    public interface IRoomDbService
    {
        Task<ResponseModel> GetAllRoomsAsync();
        Task<ResponseModel> GetBatchAsync(IEnumerable<Guid> Ids);
        Task<ResponseModel> CreateAsync(Guid buildingId, string name);
        Task<ResponseModel> GetByRoomIdOrNameAsync(Guid buildingId, string name);
    }
}