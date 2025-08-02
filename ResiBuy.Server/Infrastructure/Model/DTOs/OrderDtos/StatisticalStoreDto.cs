namespace ResiBuy.Server.Infrastructure.Model.DTOs.OrderDtos
{
    public class StatisticalStoreDto
    {
        public int ProductQuantity { get; set; }
        public int OutOfStockProductQuantity { get; set; }
        public int ReportCount {  get; set; }
        public int VoucherQuantity { get; set; }

    }
}
