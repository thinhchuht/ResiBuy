namespace ResiBuy.Server.Infrastructure.Model
{
    public class UncostData
    {
        public Guid Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public Guid CostDataId { get; set; }
        public CostData CostData { get; set; } = null!;
    }
}
