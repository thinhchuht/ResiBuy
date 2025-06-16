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

        public override string ToString()
        {
            return Message;
        }

        private static string GetDefaultMessage(ExceptionErrorCode code) => code switch
        {
            ExceptionErrorCode.NotFound => "Không tìm thấy tài nguyên.",
            ExceptionErrorCode.Forbidden => "Không được phép truy cập tài nguyên này.",
            ExceptionErrorCode.ValidationFailed => "Dữ liệu không hợp lệ.",
            ExceptionErrorCode.Unauthorized => "Truy cập bị từ chối.",
            ExceptionErrorCode.CreateFailed => "Tạo mới thất bại.",
            ExceptionErrorCode.UpdateFailed => "Cập nhật thất bại.",
            ExceptionErrorCode.DeleteFailed => "Xóa thất bại.",
            ExceptionErrorCode.RepositoryError => "Lỗi truy xuất dữ liệu.",
            ExceptionErrorCode.DuplicateValue => "Dữ liệu đã tồn tại.",
            ExceptionErrorCode.InvalidInput => "Dữ liệu đầu vào không hợp lệ.",
            _ => "Đã xảy ra lỗi không xác định."
        };

        private static int GetHttpStatus(ExceptionErrorCode code) => code switch
        {
            ExceptionErrorCode.NotFound => StatusCodes.Status404NotFound,
            ExceptionErrorCode.Forbidden => StatusCodes.Status403Forbidden,
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
