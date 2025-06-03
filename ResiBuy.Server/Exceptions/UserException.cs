namespace ResiBuy.Server.Exceptions
{
    public class UserException : Exception
    {
        public string Code { get; }

        public UserException(string code)
        {
            Code = code;
        }

        public UserException(string code, string message)
            : base(message)
        {
            Code = code;
        }

        public UserException(string code, string message, Exception innerException)
            : base(message, innerException)
        {
            Code = code;
        }

        public const string SuccessCode = "0";

        public const string InternalCode = "500";

        public static void ThrowIfOwnerInValid(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) throw new UserException("1000", "UserId is invalid");
        }
    }
}