using Hangfire;

namespace ResiBuy.BackgroundTask.Jobs
{
    public static class HangfireJobScheduler
    {
        public static void RegisterJobs(IServiceProvider serviceProvider)
        {
            var recurringJobManager = serviceProvider.GetRequiredService<IRecurringJobManager>();
            Console.WriteLine("hi thrre");
            recurringJobManager.AddOrUpdate<IVoucherService>(
                "deactivate-batch-voucher-job",
                service => service.DeactivateBatchVoucher(),
                "* * * * *"
            );
        }
    }
} 