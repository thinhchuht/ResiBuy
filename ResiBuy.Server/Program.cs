using ResiBuy.Server.Services.VNPayServices;

var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;

services.AddSqlDb(builder.Configuration)
    .AddServices()
    .AddDbServices()
    .AddKafka(builder.Configuration)
    .AddAuthenJwtBase(builder.Configuration);

services.AddSignalR();
services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining(typeof(Program)));

services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

services.AddEndpointsApiExplorer();
services.AddSwaggerGen(
    c =>
    {
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please insert JWT with Bearer into field",
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[] { }
    }
    });
    }
);
services.AddScoped<IVNPayService, VNPayService>();

var app = builder.Build();
// Đặt middleware này TRƯỚC tất cả các middleware khác
app.UseMiddleware<ExceptionMiddleware>();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification", options =>
{
    options.CloseOnAuthenticationExpiration = false;
});

app.MapFallbackToFile("/index.html");

app.Run();
