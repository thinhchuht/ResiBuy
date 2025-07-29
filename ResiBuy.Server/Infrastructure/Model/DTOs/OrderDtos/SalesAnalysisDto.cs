namespace ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos
{
    public class SalesAnalysisDto
    {
        public decimal Sales {  get; set; }
        public int NumberOfProductsSold {  get; set; }
        public int SuccessedOrderQuantity { get; set; }
        public int CancelledOrderQuantity { get; set; }
    }
}
