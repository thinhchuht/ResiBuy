namespace ResiBuy.BackgroundTask.Model
{
    public class Cart
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public bool IsCheckingOut { get; set; }
        public DateTime ExpiredCheckOutTime { get; set; }
    }
}
