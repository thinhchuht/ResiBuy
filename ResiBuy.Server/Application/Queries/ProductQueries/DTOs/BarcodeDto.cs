namespace ResiBuy.Server.Application.Queries.ProductQueries.DTOs
{
    public class BarcodeDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public Guid? OrderItemId { get;set; }
    }
}
