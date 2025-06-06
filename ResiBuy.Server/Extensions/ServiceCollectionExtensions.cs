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
            services.AddScoped(typeof(IBaseDbService<>), typeof(BaseDbService<>));
            
            // Register other services
            services.AddScoped<IUserDbService, UserDbService>();
            services.AddScoped<IUserRoomDbService, UserRoomDbService>();
            services.AddScoped<IAreaDbService, AreaDbService>();
            services.AddScoped<IBuildingDbService, BuildingDbService>();
            services.AddScoped<IRoomDbService, RoomDbService>();
            return services;
        }
    }
}
