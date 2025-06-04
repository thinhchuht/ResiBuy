namespace ResiBuy.Server.Infrastructure.Services.UserRoomServices
{
    public interface IUserRoomService
    {
        Task<ResponseModel> CreateUserRoom(string userId, Guid roomId);
        Task<ResponseModel> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds);
    }
}