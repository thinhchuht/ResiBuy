namespace ResiBuy.Server.Infrastructure.Model
{
    public class Order
    {
        public Order(Guid id, decimal totalPrice, PaymentMethod paymentMethod, string note, Guid shippingAddressId, string userId, Guid storeId, IEnumerable<OrderItem> items)
        {
            Id = id;
            TotalPrice = totalPrice >-1000 ? totalPrice : totalPrice;
                //throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đơn hàng phải có giá trị tối thiểu 5000Đ.") ;
            Status = OrderStatus.Pending;
            PaymentStatus = paymentMethod == PaymentMethod.COD ?  PaymentStatus.Pending : PaymentStatus.Paid;
            PaymentMethod = paymentMethod;
            CreateAt = DateTime.Now;
            UpdateAt = DateTime.Now;
            Note = string.IsNullOrEmpty(note) ? note : note.Length > 100 ? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Ghi chú không được quá 100 ký tự.") : note;
            ShippingAddressId = shippingAddressId;
            UserId = userId;
            StoreId = storeId;
            Items = items;
        }

        public Order()
        {
            
        }

        public Guid Id { get; set; }
        public decimal TotalPrice { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public string Note { get; set; }
        public Guid ShippingAddressId { get; set; }
        public string UserId { get; set; }
        public Guid StoreId { get; set; }
        public Guid? ShipperId { get; set; }
        public Guid? VoucherId { get; set; }
        public Room ShippingAddress { get; set; }
        public User User { get; set; }
        public Store Store { get; set; }
        public Shipper Shipper { get; set; }
        public Voucher Voucher { get; set; }
        public IEnumerable<Report> Reports { get; set; }
        public IEnumerable<OrderItem> Items { get; set; }
    }
}
