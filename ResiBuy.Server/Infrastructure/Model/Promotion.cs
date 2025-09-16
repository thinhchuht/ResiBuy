namespace ResiBuy.Server.Infrastructure.Model
{
    public class Promotion
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Discount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public List<Product> Products { get; set; } = new List<Product>();

        public Promotion()
        {

        }

        public Promotion(string name, int discount, DateTime startDate, DateTime endDate, bool isActive)
        {
            Name = name;
            Discount = discount;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }
        public void UpdatePromotion(string name, int discount, DateTime startDate, DateTime endDate, bool isActive)
        {
            Name = name;
            Discount = discount;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }
        public void UpdateStatus(bool isActive)
        {
            IsActive = isActive;
        }
    }
}
