namespace ResiBuy.Server.Application.Queries
{
    public class QueryResults
    {
        //User query result
        public record UserQueryResult(string Id, DateTime DateOfBirth, bool IsLocked, IEnumerable<string> Roles, 
            string FullName, DateTime CreatedAt, DateTime UpdatedAt, Guid CartId, IEnumerable<object> Rooms, IEnumerable<Guid> VoucherIds, IEnumerable<Report> Reports);

        //Room query result
        public record RoomQueryResult(Guid Id, string Name, Guid BuildingId, List<string> UserIds);

        //Voucher query result 
        public record VoucherQueryResult(Guid Id);
    }
}
