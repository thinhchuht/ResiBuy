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

            ResponseModel response;
            int httpStatus;

            if (exception is CustomException custom)
            {
                httpStatus = custom.HttpStatus;
                response = new ResponseModel
                {
                    Code = (int)custom.Code,
                    Message = custom.Message,
                    Data = null
                };
            }
            else
            {
                httpStatus = StatusCodes.Status500InternalServerError;
                var message = _env.IsDevelopment() ? exception.ToString() : "An unexpected error occurred.";

                response = new ResponseModel
                {
                    Code = (int)ExceptionErrorCode.Unknown,
                    Message = message,
                    Data = null
                };

                _logger.LogError(exception, "Unhandled exception occurred");
            }

            context.Response.StatusCode = httpStatus;
            return context.Response.WriteAsJsonAsync(response);
        }
    }
}
