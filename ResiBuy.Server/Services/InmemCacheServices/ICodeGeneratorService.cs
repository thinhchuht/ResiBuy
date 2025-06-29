namespace ResiBuy.Server.Common
{
    public interface ICodeGeneratorSerivce
    {
        string GenerateCodeAndCache<T>(T data, TimeSpan? expiry = null, int length = 6);
        bool TryGetCachedData<T>(string code, out T data);
    }
}