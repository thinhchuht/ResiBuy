namespace ResiBuy.Server.Infrastructure.Model
{
    public class TimeSheet
    {
        public int Id { get; set; }
        public Guid ShipperId { get; set; }
        public DateTime DateMark { get; set; }
        public bool IsLate { get; set; }
        public Shipper Shipper { get; set; }

        public TimeSheet()
        {
            
        }

        public TimeSheet(Guid shipperId, DateTime dateMark, bool isLate)
        {
            ShipperId = shipperId;
            DateMark = dateMark;
            IsLate = isLate;
        }
    }
}
