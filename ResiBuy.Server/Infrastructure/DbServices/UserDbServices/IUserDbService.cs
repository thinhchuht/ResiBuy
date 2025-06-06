namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public interface IUserDbService
    {
        Task<ResponseModel> GetUserById(string id);
        Task<ResponseModel> GetAllUsers();
        Task<ResponseModel> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null);
        Task<ResponseModel> CreateUser(RegisterDto user);
        Task<ResponseModel> CreateAdminUser(User user);

    }
}