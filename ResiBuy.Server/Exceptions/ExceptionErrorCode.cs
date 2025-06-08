namespace ResiBuy.Server.Exceptions
{
    public enum ExceptionErrorCode
    {
        Unknown = 0,
        NotFound = 404,
        ValidationFailed = 400,
        Unauthorized = 401,
        CreateFailed = 402,
        UpdateFailed = 403,
        DeleteFailed = 405,
        RepositoryError = 501,
        DuplicateValue = 409,
    }
}
