namespace ResiBuy.Server.Infrastructure.Model
{
    public class AdditionalData
    {
        public Guid Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public Guid AdditionalData1Id { get; set; }
        public CostData AdditionalData1 { get; set; } = null!;
    }
}
