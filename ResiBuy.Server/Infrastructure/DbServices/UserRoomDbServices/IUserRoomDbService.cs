namespace ResiBuy.Server.Infrastructure.DbServices.UserRoomDbServices
{
    public interface IUserRoomDbService: IBaseDbService<UserRoom>
    {
        Task<UserRoom> CreateUserRoom(string userId, Guid roomId);
        Task<IEnumerable<UserRoom>> CreateUserRoomsBatch(IEnumerable<string> userIds, IEnumerable<Guid> roomIds);
        Task DeleteUserRoom(string userId, Guid roomId);
    }
}