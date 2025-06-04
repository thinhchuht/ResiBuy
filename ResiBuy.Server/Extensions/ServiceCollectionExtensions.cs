namespace ResiBuy.Server.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddSqlDb(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ResiBuyContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("ResiBuyDb"));
            });
            return services;
        }

        public static IServiceCollection AddDbServices(this IServiceCollection services)
        {
            services.AddScoped(typeof(IBaseService<>), typeof(BaseService<>));
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserRoomService,UserRoomService>();
            return services;
        }
    }
}
