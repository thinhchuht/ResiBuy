namespace ResiBuy.Server.Application.Queries.ShipperQueries.DTOs
{
    public class TimeSheetSummaryDto
    {
        public int CountAll { get; set; }
        public int CountLate { get; set; }
        public int CountOnTime { get; set; }
        public List<TimeSheet> Data { get; set; }
    }
}
