using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;

namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public interface IUserDbService: IBaseDbService<User>
    {
        Task<User> GetUserById(string id);
        Task<IEnumerable<User>> GetAllUsers();
        Task<User> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null);
        Task<User> CreateUser(RegisterDto user);
        Task<User> CreateAdminUser(User user);

    }
}