using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Exceptions
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); // gọi middleware tiếp theo
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            if (exception is CustomException custom)
            {
                context.Response.StatusCode = custom.HttpStatus;
                return context.Response.WriteAsJsonAsync(new
                {
                    code = (int)custom.Code,
                    error = custom.Message
                });
            }

            _logger.LogError(exception, "Unhandled exception occurred");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            return context.Response.WriteAsJsonAsync(new
            {
                code = (int)ExceptionErrorCode.Unknown,
                error = "An unexpected error occurred.",
                detail = _env.IsDevelopment() ? exception.ToString() : null
            });
        }

    }

}
