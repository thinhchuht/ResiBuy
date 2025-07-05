
using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ProductDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ShipperDbServices;
using ResiBuy.Server.Infrastructure.DbServices.StoreDbServices;
using ResiBuy.Server.Services.MailServices;
using ResiBuy.Server.Infrastructure.DbServices.CartItemDbService;
using ResiBuy.Server.Infrastructure.DbServices.OrderDbServices;
using ResiBuy.Server.Infrastructure.DbServices.OrderItemDbServices;
using ResiBuy.Server.Services.CheckoutSessionService;
using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Services.ShippingCost;
using ResiBuy.Server.Services.OpenRouteService;
using ResiBuy.Server.Services.MyBackgroundService;

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
            services.AddScoped<ICartDbService, CartDbService>();
            services.AddScoped<IImageDbService, ImageDbService>();
            services.AddScoped<ICategoryDbService, CategoryDbService>();
            services.AddScoped<IProductDbService, ProductDbService>();
            services.AddScoped<IShipperDbService, ShipperDbService>();
            services.AddScoped<IStoreDbService, StoreDbService>();
            services.AddScoped<IMailBaseService, MailBaseService>();
            services.AddScoped<ICartDbService, CartDbService>();
            services.AddScoped<ICartItemDbService, CartItemDbService>();
            services.AddScoped<IOrderDbService, OrderDbService>();
            services.AddScoped<IOrderItemDbService, OrderItemDbService>();
            services.AddScoped<IProductDetailDbService, ProductDetailDbService>();
            services.AddHttpClient<GoogleDistanceService>();
            services.AddHttpClient<OpenRouteService>();
            services.AddHostedService<AssignOrderForShipper>();
            return services;
        }

        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<INotificationService, NotificationService>();
            services.AddSingleton<IKafkaProducerService, KafkaProducerService>();
            services.AddSingleton<ICheckoutSessionService, CheckoutSessionService>();
            services.AddHostedService<CheckoutSessionCleanupService>();
            return services;
        }

        public static IServiceCollection AddKafka(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<KafkaSetting>(configuration.GetSection("Kafka"));
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

        public static IServiceCollection AddCloudinary(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(configuration.GetSection("Cloudinary").Get<CloudinarySetting>());
            services.AddScoped<ICloudinaryService, CloudinaryService>();
            return services;
        }
    }
}
