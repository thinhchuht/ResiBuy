namespace ResiBuy.Server.Infrastructure.Model
{
    public class UserRoom
    {
        public string UserId { get; set; }
        public Guid   RoomId { get; set; }
        public User   User   { get; set; }
        public Room   Room   { get; set; }
    }
}
