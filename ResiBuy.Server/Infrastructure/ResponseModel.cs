namespace ResiBuy.Server.Infrastructure
{

    public class ResponseModel
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public bool IsSuccess() => Code == 0;

        public static ResponseModel SuccessResponse(object data = null) =>
            new ResponseModel { Code = 0, Message = "Success", Data = data };

        public static ResponseModel FailureResponse(string message) =>
            new ResponseModel { Code = 1, Message = message };

        public static ResponseModel ExceptionResponse(string error = null) =>
            new ResponseModel { Code = -1, Message = error ?? "There is Exception, try again" };
    }
}
