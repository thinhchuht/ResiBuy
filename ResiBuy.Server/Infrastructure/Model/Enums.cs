[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatus
{
    None,
    Pending,
    Processing,
    StoreAccepted,
    Shipped,
    Delivered,
    Cancelled
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMethod
{
    None,
    COD,
    BankTransfer
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    None,
    Pending ,
    Paid,
    Failed,
    Refunded,
}