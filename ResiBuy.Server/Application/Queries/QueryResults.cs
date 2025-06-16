namespace ResiBuy.Server.Application.Queries
{
    public class QueryResults
    {
        //User query result
        public record UserQueryResult(string Id, string Email, string PhoneNumber, DateTime DateOfBirth, bool IsLocked, IEnumerable<string> Roles, 
            string FullName, DateTime CreatedAt, DateTime UpdatedAt, Guid? CartId, AvatarQueryResult? Avatar, IEnumerable<RoomQueryResult>? Rooms, IEnumerable<Guid> VoucherIds, IEnumerable<Report> Reports);

        public record AvatarQueryResult(string Id, string Name, string Url, string ThumbUrl);

        //Room query result
        public record RoomQueryResult(Guid Id, string Name, string BuildingName, string AreaName);

        //Voucher query result 
        public record VoucherQueryResult(Guid Id);
    }
}
