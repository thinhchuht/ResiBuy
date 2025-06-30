using Microsoft.Extensions.Caching.Memory;

namespace ResiBuy.Server.Common
{
    public class CodeGeneratorSerivce(IMemoryCache cache) : ICodeGeneratorSerivce
    {
        private static readonly Random _random = new();
        private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        public string GenerateCodeAndCache<T>(T data, TimeSpan? expiry = null, int length = 6)
        {
            var code = GenerateCode(length);

            cache.Set(code, data, expiry ?? TimeSpan.FromMinutes(1));

            return code;
        }

        public bool TryGetCachedData<T>(string code, out T data)
        {
            if (cache.TryGetValue(code, out var cached) && cached is T typed)
            {
                data = typed;
                return true;
            }

            data = default;
            return false;
        }

        private string GenerateCode(int length = 6)
        {
            return new string(Enumerable.Range(0, length)
                .Select(_ => Chars[_random.Next(Chars.Length)])
                .ToArray());
        }
    }
}