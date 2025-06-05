namespace ResiBuy.Server.Infrastructure.Model
{
    public class UserRoom
    {
        public string UserId { get; set; }
        public Guid   RoomId { get; set; }
        public User   User   { get; set; }
        public Room   Room   { get; set; }
        public UserRoom()
        {
            
        }
        public UserRoom(string userId, Guid roomId)
        {
            UserId = userId;
            RoomId = roomId;
        }
    }
}
