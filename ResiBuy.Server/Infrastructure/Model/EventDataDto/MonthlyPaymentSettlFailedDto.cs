namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class MonthlyPaymentSettlFailedDto
    {
        public Guid StoreId { get; set; }
        public string StoreName { get; set; }
    }
}
