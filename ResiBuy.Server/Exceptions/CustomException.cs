namespace ResiBuy.Server.Exceptions
{
    public class CustomException : Exception
    {
        public ExceptionErrorCode Code { get; }
        public int HttpStatus { get; }

        public CustomException(ExceptionErrorCode code, string message = null, Exception inner = null)
            : base(message ?? GetDefaultMessage(code), inner)
        {
            Code = code;
            HttpStatus = GetHttpStatus(code);
        }

        public CustomException(string message) : base(message)
        {
        }

        private static string GetDefaultMessage(ExceptionErrorCode code) => code switch
        {
            ExceptionErrorCode.NotFound => "Resource not found.",
            ExceptionErrorCode.ValidationFailed => "Validation failed.",
            ExceptionErrorCode.Unauthorized => "Access denied.",
            ExceptionErrorCode.CreateFailed => "Create operation failed.",
            ExceptionErrorCode.UpdateFailed => "Update operation failed.",
            ExceptionErrorCode.DeleteFailed => "Delete operation failed.",
            ExceptionErrorCode.RepositoryError => "Repository error occurred.",
            ExceptionErrorCode.DuplicateValue => "Duplicate value found.",
            ExceptionErrorCode.InvalidInput => "Invalid input provided.",
            _ => "Unknown error occurred."
        };

        private static int GetHttpStatus(ExceptionErrorCode code) => code switch
        {
            ExceptionErrorCode.NotFound => StatusCodes.Status404NotFound,
            ExceptionErrorCode.ValidationFailed => StatusCodes.Status400BadRequest,
            ExceptionErrorCode.Unauthorized => StatusCodes.Status401Unauthorized,
            ExceptionErrorCode.CreateFailed => StatusCodes.Status400BadRequest,
            ExceptionErrorCode.UpdateFailed => StatusCodes.Status400BadRequest,
            ExceptionErrorCode.DeleteFailed => StatusCodes.Status400BadRequest,
            ExceptionErrorCode.RepositoryError => StatusCodes.Status500InternalServerError,
            ExceptionErrorCode.DuplicateValue => StatusCodes.Status409Conflict,
            ExceptionErrorCode.InvalidInput => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
    }

}
