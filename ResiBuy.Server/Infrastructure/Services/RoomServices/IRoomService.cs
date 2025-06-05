namespace ResiBuy.Server.Infrastructure.Services.RoomServices
{
    public interface IRoomService
    {
        Task<ResponseModel> GetAllRoomsAsync();
        Task<ResponseModel> CreateAsync(Guid buildingId, string name);
        Task<ResponseModel> GetByRoomIdOrNameAsync(Guid buildingId, string name);
    }
}