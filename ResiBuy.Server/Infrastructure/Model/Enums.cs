[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMethod
{
    COD,
    BankTransfer
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    Success,
    Fail,
    UnPaid
}