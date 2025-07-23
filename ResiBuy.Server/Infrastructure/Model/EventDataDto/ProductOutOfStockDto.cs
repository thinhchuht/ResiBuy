namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class ProductOutOfStockDto
    {
        public ProductOutOfStockDto(int productDetailId, string productName, string storeName, Guid storeId)
        {
            ProductDetailId = productDetailId;
            ProductName = productName;
            StoreName = storeName;
            StoreId = storeId;
        }

        public int ProductDetailId { get; set; }
        public string ProductName { get; set; }
        public string StoreName { get; set; }
        public Guid StoreId { get; set; }
    }
}
