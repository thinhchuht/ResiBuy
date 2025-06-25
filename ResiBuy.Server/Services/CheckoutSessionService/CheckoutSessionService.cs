using System.Collections.Concurrent;

namespace ResiBuy.Server.Services.CheckoutSessionService;

public class CheckoutSessionService : ICheckoutSessionService
{
    private static readonly ConcurrentDictionary<string, SessionData> _sessions = new();
    private static readonly SemaphoreSlim _cleanupSemaphore = new SemaphoreSlim(1, 1);
    private static DateTime _lastCleanup = DateTime.UtcNow;
    private static readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(2); // Cleanup every 2 minutes
    private static readonly TimeSpan _sessionExpiry = TimeSpan.FromMinutes(30); // Session expires in 30 minutes

    // Optimized session data structure
    private readonly struct SessionData
    {
        public readonly string JsonData { get; }
        public readonly DateTime ExpiryTime { get; }
        public readonly DateTime CreatedAt { get; }

        public SessionData(string jsonData, DateTime expiryTime)
        {
            JsonData = jsonData;
            ExpiryTime = expiryTime;
            CreatedAt = DateTime.UtcNow;
        }
    }

    public void StoreCheckoutSession(Guid orderId, CheckoutDto checkoutDto)
    {
        var jsonData = JsonSerializer.Serialize(checkoutDto, new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });

        var sessionData = new SessionData(jsonData, DateTime.UtcNow.Add(_sessionExpiry));
        _sessions.TryAdd(orderId.ToString(), sessionData);

        // Trigger cleanup if needed
        TriggerCleanupIfNeeded();

    }

    public CheckoutDto GetCheckoutSession(string sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out var sessionData))
        {
            if (DateTime.UtcNow <= sessionData.ExpiryTime)
            {
                try
                {
                    return JsonSerializer.Deserialize<CheckoutDto>(sessionData.JsonData);
                }
                catch
                {
                    _sessions.TryRemove(sessionId, out _);
                    return null;
                }
            }
            else
            {
                _sessions.TryRemove(sessionId, out _);
            }
        }

        return null;
    }

    public void RemoveCheckoutSession(string sessionId)
    {
        _sessions.TryRemove(sessionId, out _);
    }

    public bool IsSessionValid(string sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out var sessionData))
        {
            if (DateTime.UtcNow <= sessionData.ExpiryTime)
            {
                return true;
            }
            else
            {
                // Session expired, remove it
                _sessions.TryRemove(sessionId, out _);
            }
        }

        return false;
    }

    // Optimized cleanup with batch processing
    public async Task CleanupExpiredSessionsAsync()
    {
        if (!await _cleanupSemaphore.WaitAsync(0)) // Non-blocking
        {
            return; // Cleanup already in progress
        }

        try
        {
            var now = DateTime.UtcNow;
            var expiredSessions = new List<string>();

            // Collect expired sessions
            foreach (var kvp in _sessions)
            {
                if (now > kvp.Value.ExpiryTime)
                {
                    expiredSessions.Add(kvp.Key);
                }
            }

            // Remove expired sessions in batch
            foreach (var sessionId in expiredSessions)
            {
                _sessions.TryRemove(sessionId, out _);
            }

            _lastCleanup = now;
        }
        finally
        {
            _cleanupSemaphore.Release();
        }
    }

    // Trigger cleanup if interval has passed
    private void TriggerCleanupIfNeeded()   
    {
        if (DateTime.UtcNow - _lastCleanup > _cleanupInterval)
        {
            _ = Task.Run(async () => await CleanupExpiredSessionsAsync());
        }
    }

    // Optimized session ID generation
    private static string GenerateSessionId()
    {
        var randomBytes = new byte[24]; // Reduced from 32 to 24 bytes
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "")
            .Substring(0, 32); // Ensure consistent length
    }
}

