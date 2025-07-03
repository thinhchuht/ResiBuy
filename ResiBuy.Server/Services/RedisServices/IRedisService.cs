using StackExchange.Redis;

namespace ResiBuy.Server.Services.RedisServices
{
    public interface IRedisService
    {
        IDatabase GetDatabase();
    }
}