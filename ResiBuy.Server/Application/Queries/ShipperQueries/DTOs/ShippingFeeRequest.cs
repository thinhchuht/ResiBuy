namespace ResiBuy.Server.Application.Queries.ShipperQueries.DTOs
{
    public class ShippingFeeRequest
    {
        public Guid ShippingAddress { get; set; }
        public Guid StoreAddress { get; set; }
        public float Weight { get; set; }
    }

    public class ApiResponse<T>
    {
        public int Code { get; set; } = 0; // 0 = success, khác 0 = error
        public string Message { get; set; } = "Success";
        public T Data { get; set; }

        public ApiResponse(T data)
        {
            Data = data;
        }

        public ApiResponse(int code, string message)
        {
            Code = code;
            Message = message;
        }
    }
}
