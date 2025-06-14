namespace ResiBuy.Server.Infrastructure.Model
{
    public class AdditionalData2
    {
        public Guid Id { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public Guid AdditionalData1Id { get; set; }
        public AdditionalData1 AdditionalData1 { get; set; } = null!;
    }
}
