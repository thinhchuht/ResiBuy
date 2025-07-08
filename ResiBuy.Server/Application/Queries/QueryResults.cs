namespace ResiBuy.Server.Application.Queries
{
    public class QueryResults
    {
        //User query result
        public record UserQueryResult(string Id, string IdentityNumber, string Email, string PhoneNumber, DateTime DateOfBirth, bool IsLocked, IEnumerable<string> Roles,
            string FullName, DateTime CreatedAt, DateTime UpdatedAt, Guid? CartId, AvatarQueryResult? Avatar, IEnumerable<RoomQueryResult>? Rooms, IEnumerable<Guid> VoucherIds, IEnumerable<object> Reports, IEnumerable<object>? Stores);
        public record NotificationQueryResult(Guid Id, string EventName, DateTime CreatedAt,bool IsRead);

        public record AvatarQueryResult(string Id, string Name, string Url, string ThumbUrl);
        public record StoreQueryResult(Guid Id, string Name, string Description, bool IsLocked, bool IsOpen, int ReportCount, DateTime CreatedAt, string OwnerId, object Room);
        //Room query result
        public record RoomQueryResult(Guid Id, string Name, string BuildingName, string AreaName);

        //Voucher query result 
        public record OrderQueryResult(Guid Id, string UserId, Guid? ShipperId, DateTime CreateAt, DateTime UpdateAt, OrderStatus Status, PaymentStatus PaymentStatus, PaymentMethod PaymentMethod,
            decimal TotalPrice, decimal? ShippingFee, string Note, RoomQueryResult RoomQueryResult, object Store, object? Voucher, IEnumerable<OrderItemQueryResult> OrderItems);

        public record OrderItemQueryResult(Guid Id,int ProductId, int ProductDetailId, string ProductName, int Quantity, decimal Price, object Image);

        public record VoucherQueryResult(Guid Id ,decimal DiscountAmount ,string Type ,int Quantity,decimal MinOrderPrice , decimal MaxDiscountPrice , DateTime StartDate, DateTime EndDate , bool IsActive , Guid StoreId);
    }
}
