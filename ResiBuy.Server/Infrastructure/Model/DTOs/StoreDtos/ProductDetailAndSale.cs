namespace ResiBuy.Server.Infrastructure.Model.DTOs.StoreDtos
{
    public class ProductDetailAndSale
    {
        public ProductDetailDto ProductDetail { get; set; }
        public int Ordercount { get; set; }
        public decimal TotalSales { get; set; }
        public int SaleCount { get; set; }

        public ProductDetailAndSale(ProductDetailDto productDetail, int ordercount, decimal totalSales, int saleCount)
        {
            ProductDetail = productDetail;
            Ordercount = ordercount;
            TotalSales = totalSales;
            SaleCount = saleCount;
        }
    }
}
