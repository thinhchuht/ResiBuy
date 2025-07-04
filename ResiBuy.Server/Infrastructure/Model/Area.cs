using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Infrastructure.Model
{
    public class Area
    {
        public Guid                  Id        { get; set; }
        public string                Name      { get; set; }
        public bool                  IsActive  { get; set; }
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
        public IEnumerable<Building> Buildings { get; set; } 
        public IEnumerable<Shipper>  Shippers  { get; set; }
        public Area()
        {
            
        }
        public Area(string name, double lat, double lon)
        {
            Name = name;
            IsActive = true;
            Latitude = lat;
            Longitude = lon;
        }
        public void UpdateArea(string name, double lat,double lon, bool? isActive = null)
        {
            if (!string.IsNullOrWhiteSpace(name))
                Name = name;
            if (isActive.HasValue)
                IsActive = isActive.Value;
            if (lat >= -90 && lat <= 90)
                Latitude = lat;
            if (lon >= -180 && lon <= 180)
                Longitude = lon;
        }
        public Area UpdateAreaStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }

}
