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
            // Register base service
            services.AddScoped(typeof(IBaseService<>), typeof(BaseService<>));
            
            // Register other services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserRoomService, UserRoomService>();
            services.AddScoped<IAreaService, AreaService>();
            services.AddScoped<IBuildingService, BuildingService>();
            services.AddScoped<IRoomService, RoomService>();
            return services;
        }
    }
}
