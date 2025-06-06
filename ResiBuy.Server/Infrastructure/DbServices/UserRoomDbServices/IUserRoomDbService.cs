namespace ResiBuy.Server.Infrastructure.DbServices.UserRoomDbServices
{
    public interface IUserRoomDbService
    {
        Task<ResponseModel> CreateUserRoom(string userId, Guid roomId);
        Task<ResponseModel> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds);
    }
}