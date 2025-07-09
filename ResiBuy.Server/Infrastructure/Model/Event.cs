namespace ResiBuy.Server.Infrastructure.Model
{
    public class Event
    {
        public Guid     Id          { get; set; }
        public string   Title       { get; set; }
        public string   Description { get; set; }
        public Guid     StoreId     { get; set; }
        public DateTime StartTime   { get; set; }
        public DateTime EndTime     { get; set; }
    }
}
