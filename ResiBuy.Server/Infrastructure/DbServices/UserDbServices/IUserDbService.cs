﻿using ResiBuy.Server.Infrastructure.Filter;

namespace ResiBuy.Server.Infrastructure.DbServices.UserDbServices
{
    public interface IUserDbService : IBaseDbService<User>
    {
        Task<User> GetUserById(string id);
        Task<PagedResult<UserQueryResult>> GetAllUsers(int pageNumber = 1, int pageSize = 10);
        Task<User> GetUserAsync(string userId, string identityNumber = null, string phoneNumber = null, string email = null);
        Task<User> CreateUser(RegisterDto user);
        Task<User> CreateAdminUser(User user);
    }
}