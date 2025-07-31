[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatus
{
    None,
    Pending, // Chờ store xác nhận
    Processing, // Spore đã xác nhận, đang đợi ship
    ShippedAccepted , //Shipper đã xác nhận đơn hàng 
    Shipped, //Shipper đang cầm hàng và đang giao
    Delivered, // Đã giao hàng
    CustomerNotAvailable, // Khách không có mặt để nhận hàng
    Cancelled, // Hủy đơn hàng
    Reported // Đơn hàng bị báo cáo
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
    Pending, // Chưa thanh toán
    Paid, // Đã thanh tonas
    Failed, // Thanh toán thất bại
    Refunded, // Đã hoàn tiền
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReportTarget
{
    None = 0,
    Customer = 1,
    Store = 2,
    Shipper = 3,
}