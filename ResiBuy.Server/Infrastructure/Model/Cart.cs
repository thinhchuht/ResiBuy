using DocumentFormat.OpenXml.Office2010.PowerPoint;

namespace ResiBuy.Server.Infrastructure.Model
{
    public class Cart
    {
        public Guid                  Id        { get; set; }
        public string                UserId    { get; set; }
        public User                  User      { get; set; }
        public IEnumerable<CartItem> CartItems { get; set; }
        public bool IsCheckingOut { get; set; }
        public DateTime ExpiredCheckOutTime { get; set; }   
        public byte[]                RowVersion { get; set; }
        public Cart()
        {
            
        }

        public Cart(Guid id)
        {
            Id = id;
            IsCheckingOut = false;
        }

        public Cart(string userId)
        {
            Id = Guid.Parse(userId);
            UserId = userId;
            IsCheckingOut = false;
        }

        public void UpdateStatus()
        {
            IsCheckingOut = !IsCheckingOut;
        }
    }

}
