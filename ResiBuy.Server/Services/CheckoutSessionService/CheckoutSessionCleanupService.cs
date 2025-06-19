using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ResiBuy.Server.Services.CheckoutSessionService;

public class CheckoutSessionCleanupService : BackgroundService
{
    private readonly ICheckoutSessionService _sessionService;
    private readonly ILogger<CheckoutSessionCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(2); // Cleanup every 2 minutes
    private readonly TimeSpan _maxCleanupDuration = TimeSpan.FromSeconds(30); // Max cleanup time

    public CheckoutSessionCleanupService(
        ICheckoutSessionService sessionService,
        ILogger<CheckoutSessionCleanupService> logger)
    {
        _sessionService = sessionService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Checkout session cleanup service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Cleanup expired sessions
                if (_sessionService is CheckoutSessionService concreteService)
                {
                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();

                    await concreteService.CleanupExpiredSessionsAsync();

                    stopwatch.Stop();

                    // Get statistics for monitoring
                    var stats = concreteService.GetSessionStatistics();

                    _logger.LogInformation(
                        "Session cleanup completed in {Duration}ms. " +
                        "Active: {ActiveSessions}, Expired: {ExpiredSessions}, " +
                        "Total: {TotalSessions}, Memory: {MemoryUsage}KB",
                        stopwatch.ElapsedMilliseconds,
                        stats.ActiveSessions,
                        stats.ExpiredSessions,
                        stats.TotalSessions,
                        stats.MemoryUsageEstimate / 1024);

                    // Adaptive cleanup interval based on session count
                    var adaptiveInterval = GetAdaptiveCleanupInterval(stats.TotalSessions);
                    await Task.Delay(adaptiveInterval, stoppingToken);
                }
                else
                {
                    await Task.Delay(_cleanupInterval, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Checkout session cleanup service stopped");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during session cleanup");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait 1 minute before retry
            }
        }
    }

    // Adaptive cleanup interval based on session count
    private TimeSpan GetAdaptiveCleanupInterval(int sessionCount)
    {
        return sessionCount switch
        {
            < 100 => TimeSpan.FromMinutes(5),    // Few sessions: cleanup every 5 minutes
            < 1000 => TimeSpan.FromMinutes(2),   // Medium sessions: cleanup every 2 minutes
            < 10000 => TimeSpan.FromMinutes(1),  // Many sessions: cleanup every 1 minute
            _ => TimeSpan.FromSeconds(30)        // Very many sessions: cleanup every 30 seconds
        };
    }
}