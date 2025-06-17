namespace ResiBuy.Server.Infrastructure.Model
{
    public class CostData
    {
        public Guid                     Id           { get; set; }
        public string                   Key          { get; set; }
        public string                   Value        { get; set; }
        public decimal                  Price        { get; set; }
        public bool                     IsOutOfStock { get; set; }
        public Guid                     ProductId    { get; set; }
        public Product                  Product      { get; set; } = null!;
        public IEnumerable<UncostData>? UncostData   { get; set; }
    }
}
