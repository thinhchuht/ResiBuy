namespace ResiBuy.Server.Infrastructure.Model.EventDataDto
{
    public class CartAddedDto
    {
        public Guid CartId          { get; set; }
        public Guid Id              { get; set; }
        public int  Quantity        { get; set; }
        public int  ProductDetailId { get; set; }

    }
}
