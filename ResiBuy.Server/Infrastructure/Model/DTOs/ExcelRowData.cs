namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class ExcelRowData
    {
        public string Describe { get; set; }
        public int PromotionId { get; set; }
        public Guid StoreId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal Price { get; set; }
        public float Weight { get; set; }
        public int Quantity { get; set; }
        public bool OutOfStock { get; set; }
        public string ImageId { get; set; }
        public List<AdditionalData> AdditionalData { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int? WarrantyMonths { get; set; }
    }
}
