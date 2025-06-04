namespace ResiBuy.Server.Infrastructure.Services.UserServices
{
    public interface IUserService
    {
        Task<ResponseModel> GetUserById(string id);
        Task<ResponseModel> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null);
        Task<ResponseModel> CreateUser(RegisterDTO user);

    }
}