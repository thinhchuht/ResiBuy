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
            services.AddScoped(typeof(IBaseDbService<>), typeof(BaseDbService<>));
            services.AddScoped<IUserDbService, UserDbService>();
            services.AddScoped<IUserRoomDbService, UserRoomDbService>();
            services.AddScoped<IAreaDbService, AreaDbService>();
            services.AddScoped<IBuildingDbService, BuildingDbService>();
            services.AddScoped<IRoomDbService, RoomDbService>();
            return services;
        }

        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<INotificationService, NotificationService>();
            services.AddSingleton<IKafkaProducerService, KafkaProducerService>();
            return services;
        }

        public static IServiceCollection AddKafka(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<KafkaSettings>(configuration.GetSection("Kafka"));
            return services;
        }

        public static IServiceCollection AddIdentityBase(this IServiceCollection services)
        {
            services.AddIdentity<User, IdentityRole>(options =>
             {
                 options.User.RequireUniqueEmail = true;
                 options.Password.RequireDigit = false;
                 options.Password.RequireLowercase = false;
                 options.Password.RequireUppercase = false;
                 options.Password.RequireNonAlphanumeric = false;
                 options.User.AllowedUserNameCharacters = null;
             })
                .AddEntityFrameworkStores<ResiBuyContext>()
                .AddDefaultTokenProviders();
            return services;
        }

        public static IServiceCollection AddAuthenJwtBase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"])),
                    RoleClaimType = ClaimTypes.Role
                };
            });
            return services;
        }
    }
}
