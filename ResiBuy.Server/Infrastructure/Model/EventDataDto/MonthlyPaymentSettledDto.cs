namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class MonthlyPaymentSettledDto
    {
        public Guid StoreId { get; set; }
        public string StoreName { get; set; }
        public decimal Revenue { get; set; }
        public int PaymentMonth { get; set; }
    }
}
