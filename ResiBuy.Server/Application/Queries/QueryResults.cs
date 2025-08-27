namespace ResiBuy.Server.Application.Queries
{
    public class QueryResults
    {
        //User query result
        public record UserQueryResult(string Id, string IdentityNumber, string Email, string PhoneNumber, DateTime DateOfBirth, bool IsLocked, IEnumerable<string> Roles,
            string FullName, DateTime CreatedAt, DateTime UpdatedAt, Guid? CartId, AvatarQueryResult? Avatar, IEnumerable<RoomQueryResult>? Rooms, IEnumerable<Guid> VoucherIds, IEnumerable<object> Reports, IEnumerable<object>? Stores, int ReportCount, bool? ShipperIsLocked = null);
        public record NotificationQueryResult(Guid Id, string EventName, DateTime CreatedAt,bool IsRead, string Data);

        public record AvatarQueryResult(string Id, string Name, string Url, string ThumbUrl);
        public record StoreQueryResult(Guid Id, string Name, string Description, bool IsLocked, bool IsOpen,int ReportCount, DateTime CreatedAt, string OwnerId,string PhoneNumber, bool IsPayFee, object Room);
        //Room query result
        public record ReportQueryResult(Guid Id, bool IsResolved, string Title, string Description, DateTime CreatedAt, string CreatedById, ReportTarget ReportTarget, string TargetId, Guid OrderId);
        public record RoomQueryResult(Guid Id, string Name, string BuildingName, string AreaName, Guid AreaId);
        public record ReviewQueryResult(Guid Id, object ProductDetail, int Rate, string Comment, object User, bool IsAnonymous, DateTime CreatedAt, DateTime UpdatedAt);

        public record AverageRateQueryResult(int ProductId, float AverageRating, int TotalReviews, IEnumerable<RatingDistributionQueryResult> Distribution);
        public record RatingDistributionQueryResult(int Stars, int Count, double Percentage);
        //Voucher query result ,
        public record OrderQueryResult(Guid Id, string UserId, object? User , object? Shipper, DateTime CreateAt, DateTime UpdateAt, OrderStatus Status, PaymentStatus PaymentStatus, PaymentMethod PaymentMethod,
            decimal TotalPrice, decimal? ShippingFee, string Note, string CancelReason, ReportQueryResult Report, RoomQueryResult RoomQueryResult, object Store, object? Voucher, IEnumerable<OrderItemQueryResult> OrderItems);
        public record AddtionalDataQueryResult(int Id, string Key, string Value);
        public record OrderItemQueryResult(Guid Id,int ProductId, int ProductDetailId, Guid? ReviewId, string ProductName, int Quantity, decimal Price, object Image, List<AddtionalDataQueryResult> AddtionalData);

        public record VoucherQueryResult(Guid Id ,decimal DiscountAmount ,string Type ,int Quantity,decimal MinOrderPrice , decimal MaxDiscountPrice , DateTime StartDate, DateTime EndDate , bool IsActive , Guid StoreId);
        public record ReportStatusCountQueryResult(int Total, int Resolved, int UnResolved, int CustomerTarget, int StoreTarget, int ShipperTarget);

    }
}
