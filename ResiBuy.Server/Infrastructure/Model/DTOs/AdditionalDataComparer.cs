namespace ResiBuy.Server.Infrastructure.Model.DTOs
{
    public class AdditionalDataComparer : IEqualityComparer<AdditionalData>
    {
        public bool Equals(AdditionalData x, AdditionalData y)
        {
            return x.Key == y.Key && x.Value == y.Value;
        }

        public int GetHashCode(AdditionalData obj)
        {
            return (obj.Key + obj.Value).GetHashCode();
        }
    }
}
